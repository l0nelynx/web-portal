import { Check, ShoppingCart, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApiError, WebInvoiceResponse, WebMenuNode, webPayments } from "../../api/client";
import { useLang } from "../../locale";

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

export default function BuyTab() {
  const { L, lang } = useLang();
  const [tree, setTree] = useState<WebMenuNode[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<(number | null)[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [payingCreditsId, setPayingCreditsId] = useState<number | null>(null);
  const [invoice, setInvoice] = useState<WebInvoiceResponse | null>(null);

  const isRu = lang === "ru";

  const chipLabel = (depth: number) => {
    if (isRu) return depth === 0 ? "Тариф" : depth === 1 ? "Период" : "Подкатегория";
    return depth === 0 ? "Tariff" : depth === 1 ? "Period" : "Subcategory";
  };
  const invoiceLabel = isRu ? "Метод оплаты" : "Payment method";
  const selectHint = isRu ? "Выберите категорию выше" : "Select a category above";
  const noTariffsHint = isRu ? "Тарифы не найдены" : "No tariffs found";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await webPayments.getMenu();
      setTree(resp.tree);
      setBalance(resp.balance);
    } catch {
      setError(L.err_load_plans);
    } finally {
      setLoading(false);
    }
  }, [L.err_load_plans]);

  useEffect(() => { load(); }, [load]);

  const { chipLevels, invoices } = useMemo(() => {
    if (!tree.length) return { chipLevels: [], invoices: [] };
    return buildView(tree, selections);
  }, [tree, selections]);

  const selectedInvoice = useMemo(
    () => invoices.find((n) => n.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId]
  );

  const pointsCost = selectedInvoice?.invoice?.points_cost ?? 0;
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
    setSelectedInvoiceId((prev) => (prev === id ? null : id));
  }

  async function handleBuyFiat() {
    if (!selectedInvoiceId) return;
    setBuyingId(selectedInvoiceId);
    try {
      const resp = await webPayments.createInvoice(selectedInvoiceId);
      setInvoice(resp);
    } catch (e) {
      let errMsg = L.err_invoice;
      if (e instanceof ApiError) {
        if (e.status === 429) errMsg = L.err_rate_limited_inv;
        else if (e.code === "provider_unavailable") errMsg = L.err_provider;
        else if (e.code === "email_not_verified") errMsg = L.err_not_verified;
      }
      toast.error(errMsg);
    } finally {
      setBuyingId(null);
    }
  }

  async function handlePayCredits() {
    if (!selectedInvoiceId || !canPayCredits) return;
    setPayingCreditsId(selectedInvoiceId);
    try {
      const resp = await webPayments.payWithCredits(selectedInvoiceId);
      if (resp.ok) {
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
      setPayingCreditsId(null);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-2">
          <ShoppingCart size={18} className="text-muted-foreground" />
          <h4 className="m-0 text-lg font-semibold text-foreground">{L.buy_title}</h4>
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-2">
          <ShoppingCart size={18} className="text-muted-foreground" />
          <h4 className="m-0 text-lg font-semibold text-foreground">{L.buy_title}</h4>
        </div>
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const payInvoice = selectedInvoice?.invoice;
  const payPrice = payInvoice?.amount ?? 0;
  const payCurrency = payInvoice?.currency ?? "";

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <ShoppingCart size={18} className="text-muted-foreground" />
        <h4 className="m-0 text-lg font-semibold text-foreground">{L.buy_title}</h4>
      </div>

      {balance > 0 && (
        <Alert variant="info" className="mb-5 rounded-xl">
          <Wallet className="h-4 w-4" />
          <AlertDescription className="flex flex-wrap items-center gap-2">
            <span>{L.bonus_balance(balance)}</span>
            <Badge variant="secondary">{L.points_hint}</Badge>
          </AlertDescription>
        </Alert>
      )}

      {chipLevels.length === 0 && invoices.length === 0 && (
        <div className="tariff-hint">{noTariffsHint}</div>
      )}

      {chipLevels.map((chips, depth) => (
        <div key={depth} className="mb-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {chipLabel(depth)}
          </div>
          <div className="chip-row-wrap">
            <div className="chip-row">
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  className={`plan-chip${selections[depth] === chip.id ? " active" : ""}`}
                  onClick={() => selectChip(depth, chip.id)}
                >
                  {chip.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {chipLevels.length > 0 && invoices.length === 0 && (
        <div className="tariff-hint">{selectHint}</div>
      )}

      {invoices.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {invoiceLabel}
          </div>
          <div className="tariff-scroll-wrap">
            <div className="tariff-scroll">
              {invoices.map((n) => {
                const inv = n.invoice!;
                const isSelected = selectedInvoiceId === n.id;

                return (
                  <div
                    key={n.id}
                    className={`tariff-card${isSelected ? " selected" : ""}`}
                    onClick={() => selectInvoice(n.id)}
                  >
                    <div className="tariff-card__name">{n.text}</div>
                    <div className="tariff-card__price-row">
                      <div className="tariff-card__price">{inv.amount.toFixed(0)}</div>
                      <div className="tariff-card__currency">{inv.currency}</div>
                    </div>
                    {(inv.days ?? 0) > 0 && (
                      <div className="mt-1 text-[11px] opacity-50">
                        {L.days(inv.days ?? 0)}
                      </div>
                    )}
                    {isSelected && (
                      <div className="tariff-card__check">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <div className="mt-2 flex flex-col gap-2.5 rounded-2xl border border-border bg-card px-5 py-4">
          <div>
            <span className="text-[13px] text-muted-foreground">{selectedInvoice.text}</span>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-[22px] font-extrabold text-foreground">{payPrice.toFixed(0)}</span>
              <span className="text-sm text-muted-foreground">{payCurrency}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {canPayCredits && (
              <Button
                size="lg"
                disabled={payingCreditsId === selectedInvoiceId}
                onClick={handlePayCredits}
                className="w-full rounded-xl font-bold"
              >
                {L.btn_pay_credits(pointsCost)}
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              disabled={buyingId === selectedInvoiceId}
              onClick={handleBuyFiat}
              className="w-full rounded-xl font-bold"
            >
              {L.btn_pay} · {payPrice.toFixed(0)} {payCurrency}
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!invoice} onOpenChange={(open) => !open && setInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{L.invoice_title}</DialogTitle>
          </DialogHeader>
          {invoice && (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-secondary px-5 py-4">
                <div className="mb-2 flex justify-between">
                  <span className="text-muted-foreground">{L.to_pay}</span>
                  <span className="text-xl font-semibold text-foreground">
                    {invoice.amount.toFixed(0)} {invoice.currency}
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                className="h-12 w-full rounded-xl font-semibold"
                onClick={() => {
                  window.open(invoice.url, "_blank");
                  setInvoice(null);
                }}
              >
                {L.btn_proceed}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
