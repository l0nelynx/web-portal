import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { paymentParams, trackEvent } from "../../analytics";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ApiError,
  managedSubscriptions,
  me,
  WebInvoiceResponse,
  WebMenuNode,
  webPayments,
} from "../../api/client";
import { useLang } from "../../locale";
import { subscriptionName } from "../../lib/subscription-name";

function formatPrice(amount: number, currency: string, lang: string) {
  try {
    return amount.toLocaleString(lang, { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 20 });
  } catch {
    return `${amount.toLocaleString(lang)} ${currency}`;
  }
}

interface ViewResult {
  chipLevels: WebMenuNode[][];
  invoices: WebMenuNode[];
}

function buildView(nodes: WebMenuNode[], selections: (number | null)[], depth = 0): ViewResult {
  const btns = nodes.filter((n) => n.action === "buttons");
  const invs = nodes.filter((n) => n.action === "invoice");

  if (btns.length === 0) return { chipLevels: [], invoices: invs };

  const selectedId = selections[depth] ?? null;
  const selNode = selectedId !== null ? btns.find((n) => n.id === selectedId) : undefined;

  if (!selNode) return { chipLevels: [btns], invoices: invs };

  const nested = buildView(selNode.children, selections, depth + 1);
  return { chipLevels: [btns, ...nested.chipLevels], invoices: nested.invoices };
}

export default function BuyTab({ targetSubscriptionId, renewing }: { targetSubscriptionId?: number; renewing: boolean }) {
  const { L, lang } = useLang();
  const [tree, setTree] = useState<WebMenuNode[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"menu" | "target" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [selections, setSelections] = useState<(number | null)[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [payingCreditsId, setPayingCreditsId] = useState<number | null>(null);
  const [invoice, setInvoice] = useState<WebInvoiceResponse | null>(null);
  const [targetLabel, setTargetLabel] = useState<string | null>(null);
  const busy = useRef(false);
  const lastList = useRef("");
  const invoiceAnalytics = useRef<Record<string, unknown>>({});

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(null);
    async function loadTargetName() {
      if (!renewing) return null;
      if (!targetSubscriptionId) return (await me.get()).subscription?.tariff ?? null;
      const { subscriptions } = await managedSubscriptions.list();
      const target = subscriptions.find(sub => sub.id === targetSubscriptionId);
      return target ? subscriptionName(target, subscriptions) : null;
    }

    async function load() {
      try {
        const [menu, name] = await Promise.all([webPayments.getMenu(), loadTargetName()]);
        if (!current) return;
        if (renewing && !name) {
          setError("target");
          return;
        }
        setTargetLabel(name);
        setTree(menu.tree);
        setBalance(menu.balance);
      } catch {
        if (current) setError("menu");
      } finally {
        if (current) setLoading(false);
      }
    }
    void load();
    return () => { current = false; };
  }, [targetSubscriptionId, renewing, attempt]);

  const title = renewing ? (targetLabel ? L.renew_named(targetLabel) : L.renew_subscription) : L.buy_title;

  const { chipLevels, invoices } = useMemo(() => {
    if (!tree.length) return { chipLevels: [], invoices: [] };
    return buildView(tree, selections);
  }, [tree, selections]);

  const selectedInvoice = useMemo(
    () => invoices.find((n) => n.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId]
  );

  const pointsCost = selectedInvoice?.invoice?.points_cost ?? 0;
  useEffect(() => {
    const signature = invoices.map((n) => n.id).join(",");
    if (!signature || signature === lastList.current) return;
    lastList.current = signature;
    // Payment choices can have different currencies; report each independently.
    for (const node of invoices) {
      if (node.invoice) trackEvent("view_item_list", {
        ...paymentParams(node.invoice, renewing), item_list_id: "web_tariffs",
      });
    }
  }, [invoices, renewing]);
  const canPayCredits = pointsCost > 0 && balance >= pointsCost;

  function selectChip(depth: number, id: number) {
    setSelections((prev) => {
      const toggling = prev[depth] === id;
      const next = prev.slice(0, depth);
      next[depth] = toggling ? null : id;
      return next;
    });
    setSelectedInvoiceId(null);
  }

  function selectInvoice(id: number) {
    const node = invoices.find((item) => item.id === id);
    if (id !== selectedInvoiceId && node?.invoice) {
      trackEvent("select_item", { ...paymentParams(node.invoice, renewing), item_list_id: "web_tariffs" });
    }
    setSelectedInvoiceId(id);
  }

  async function handleBuyFiat() {
    if (!selectedInvoiceId || !selectedInvoice?.invoice || busy.current) return;
    busy.current = true;
    const params = paymentParams(selectedInvoice.invoice, renewing);
    trackEvent("begin_checkout", params);
    setBuyingId(selectedInvoiceId);
    try {
      const resp = await webPayments.createInvoice(
        selectedInvoiceId,
        undefined,
        targetSubscriptionId
      );
      setInvoice(resp);
      invoiceAnalytics.current = { ...params, value: resp.amount, currency: resp.currency,
        items: params.items.map((item) => ({ ...item, price: resp.amount })),
        transaction_id: resp.transaction_id, payment_provider: resp.provider, payment_type: resp.payment_method };
      trackEvent("invoice_created", invoiceAnalytics.current);
    } catch (e) {
      let errMsg = L.err_invoice;
      if (e instanceof ApiError) {
        if (e.status === 429) errMsg = L.err_rate_limited_inv;
        else if (e.code === "provider_unavailable") errMsg = L.err_provider;
        else if (e.code === "email_not_verified") errMsg = L.err_not_verified;
      }
      toast.error(errMsg);
      trackEvent("checkout_error", { ...params, error_code: e instanceof ApiError ? e.code : "network_error" });
    } finally {
      busy.current = false;
      setBuyingId(null);
    }
  }

  async function handlePayCredits() {
    if (!selectedInvoiceId || !canPayCredits || busy.current) return;
    busy.current = true;
    trackEvent("credits_checkout", { points_cost: pointsCost, purchase_kind: renewing ? "renewal" : "new" });
    setPayingCreditsId(selectedInvoiceId);
    try {
      const resp = await webPayments.payWithCredits(selectedInvoiceId, targetSubscriptionId);
      if (resp.ok) {
        trackEvent("credits_purchase", { transaction_id: resp.transaction_id, points_spent: resp.points_spent ?? pointsCost });
        if (resp.balance_after != null) setBalance(resp.balance_after);
        toast.success(L.msg_paid_with_credits);
      }
    } catch (e) {
      let errMsg = L.err_invoice;
      if (e instanceof ApiError) {
        if (e.code === "insufficient_credits") errMsg = L.err_insufficient_credits;
        else if (e.code === "email_not_verified") errMsg = L.err_not_verified;
      }
      toast.error(errMsg);
    } finally {
      busy.current = false;
      setPayingCreditsId(null);
    }
  }

  const payInvoice = selectedInvoice?.invoice;
  const selectedPath = chipLevels.flatMap((level, depth) => {
    const chosen = level.find(node => node.id === selections[depth]);
    return chosen ? [chosen.text] : [];
  });
  const description = [targetLabel, selectedPath[0] || payInvoice?.tariff_slug,
    payInvoice?.days ? L.days(payInvoice.days) : selectedPath[1], ...selectedPath.slice(2),
  ].filter((part, i, parts) => part && parts.indexOf(part) === i).join(" · ");
  const processing = buyingId !== null || payingCreditsId !== null;

  return (
    <div className="max-w-3xl">
      <h1 className="dashboard-title mb-6">{title}</h1>
      {loading ? (
        <div className="grid gap-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-10 w-64" /></div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error === "target" ? L.renew_target_missing : L.err_load_plans}</AlertDescription>
          <Button variant="outline" className="mt-3 text-foreground" onClick={() => setAttempt(a => a + 1)}>{L.btn_retry_app}</Button>
        </Alert>
      ) : (
        <>
          {balance > 0 && (
            <Alert className="mb-5 bg-card">
              <Wallet /><AlertDescription>
                {L.bonus_balance(balance)} <span className="text-muted-foreground">{L.points_hint}</span>
              </AlertDescription>
            </Alert>
          )}
          {chipLevels.map((chips, depth) => (
            <fieldset key={depth} disabled={processing} className="mb-5">
              <legend className="mb-2 text-sm font-medium">{[L.label_plan, L.plan_period][depth] ?? L.plan_category}</legend>
              <div className="flex flex-wrap gap-2">
                {chips.map(chip => (
                  <Button key={chip.id} aria-pressed={selections[depth] === chip.id}
                    variant={selections[depth] === chip.id ? "default" : "outline"}
                    className="h-auto min-h-9 max-w-full whitespace-normal rounded-full transition-none"
                    onClick={() => selectChip(depth, chip.id)}>{chip.text}</Button>
                ))}
              </div>
            </fieldset>
          ))}
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">{chipLevels.length ? L.choose_category : L.no_tariffs}</p>
          ) : (
            <fieldset disabled={processing} className="mb-5">
              <legend className="mb-2 text-sm font-medium">{L.payment_method}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {invoices.map(node => {
                  const inv = node.invoice!;
                  return (
                    <label key={node.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-4 has-checked:border-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring">
                      <input className="size-4 shrink-0 accent-primary" type="radio" name="payment-method"
                        value={node.id} checked={node.id === selectedInvoiceId} onChange={() => selectInvoice(node.id)} />
                      <span className="min-w-0 flex-1 text-sm font-medium [overflow-wrap:anywhere]">{node.text}</span>
                      <span className="text-sm tabular-nums">{formatPrice(inv.amount, inv.currency, lang)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
          {payInvoice && (
            <div className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
              <p aria-live="polite" className="text-base font-semibold [overflow-wrap:anywhere]">
                {[description, formatPrice(payInvoice.amount, payInvoice.currency, lang)].filter(Boolean).join(" · ")}
              </p>
              <div className="grid gap-2 sm:flex sm:flex-wrap">
                <Button disabled={processing} onClick={handleBuyFiat}>{L.btn_proceed}</Button>
                {canPayCredits && (
                  <Button variant="outline" disabled={processing} onClick={handlePayCredits}>
                    {L.btn_pay_credits(pointsCost)}
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
      <Dialog open={!!invoice} onOpenChange={open => !open && setInvoice(null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader><DialogTitle>{L.invoice_title}</DialogTitle></DialogHeader>
          {invoice && (
            <>
              <p className="rounded-lg bg-secondary p-4 font-medium [overflow-wrap:anywhere]">
                {[description, formatPrice(invoice.amount, invoice.currency, lang)].filter(Boolean).join(" · ")}
              </p>
              <Button asChild size="lg">
                <a href={invoice.url} target="_blank" rel="noopener noreferrer" onClick={() => {
                  trackEvent("payment_redirect", invoiceAnalytics.current);
                  setInvoice(null);
                }}>{L.btn_proceed}</a>
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
