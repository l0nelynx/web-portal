import { Alert, Button, Modal, Skeleton, Space, Tag, Typography } from "antd";
import { CheckOutlined, ShoppingCartOutlined, WalletOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, WebInvoiceResponse, WebMenuNode, webPayments } from "../../api/client";
import { useLang } from "../../locale";

const { Title, Text } = Typography;

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
  const { L } = useLang();
  const [tree, setTree] = useState<WebMenuNode[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<(number | null)[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [payingCreditsId, setPayingCreditsId] = useState<number | null>(null);
  const [invoice, setInvoice] = useState<WebInvoiceResponse | null>(null);

  const isRu = L.lang_toggle === "EN";

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

  const creditDays = selectedInvoice?.invoice?.days ?? 0;
  const canPayCredits = creditDays > 0 && balance >= creditDays;

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
      Modal.error({ title: "Error", content: errMsg, centered: true });
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
        Modal.success({
          title: L.msg_paid_with_credits,
          centered: true,
          okText: "OK",
        });
      }
    } catch (e) {
      let errMsg = L.err_invoice;
      if (e instanceof ApiError) {
        if (e.code === "insufficient_credits") errMsg = L.err_insufficient_credits;
        else if (e.code === "email_not_verified") errMsg = L.err_not_verified;
      }
      Modal.error({ title: "Error", content: errMsg, centered: true });
    } finally {
      setPayingCreditsId(null);
    }
  }

  if (loading) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <ShoppingCartOutlined style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }} />
          <Title level={4} style={{ color: "#fff", margin: 0 }}>{L.buy_title}</Title>
        </div>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {[1, 2].map((i) => <Skeleton key={i} active paragraph={{ rows: 2 }} />)}
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <ShoppingCartOutlined style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }} />
          <Title level={4} style={{ color: "#fff", margin: 0 }}>{L.buy_title}</Title>
        </div>
        <Alert type="error" message={error} showIcon style={{ borderRadius: 12 }} />
      </div>
    );
  }

  const payInvoice = selectedInvoice?.invoice;
  const payPrice = payInvoice?.amount ?? 0;
  const payCurrency = payInvoice?.currency ?? "";

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <ShoppingCartOutlined style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }} />
        <Title level={4} style={{ color: "#fff", margin: 0 }}>{L.buy_title}</Title>
      </div>

      {balance > 0 && (
        <Alert
          icon={<WalletOutlined />}
          type="info"
          showIcon
          message={
            <Space wrap>
              <span>{L.bonus_balance(balance)}</span>
              <Tag color="blue">{L.credit_one_day_hint}</Tag>
            </Space>
          }
          style={{ borderRadius: 12, marginBottom: 20 }}
        />
      )}

      {chipLevels.length === 0 && invoices.length === 0 && (
        <div className="tariff-hint">{noTariffsHint}</div>
      )}

      {chipLevels.map((chips, depth) => (
        <div key={depth} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.30)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 8,
          }}>
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
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.30)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 8,
          }}>
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
                      <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
                        {L.days(inv.days ?? 0)}
                      </div>
                    )}
                    {isSelected && (
                      <div className="tariff-card__check">
                        <CheckOutlined />
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
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "16px 20px",
          background: "rgba(124,156,255,0.08)",
          border: "1px solid rgba(124,156,255,0.25)",
          borderRadius: 16,
          marginTop: 8,
          animation: "slideUp 0.2s ease",
        }}>
          <div>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              {selectedInvoice.text}
            </Text>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#9DB8FF" }}>
                {payPrice.toFixed(0)}
              </span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)" }}>{payCurrency}</span>
            </div>
          </div>
          <Space direction="vertical" style={{ width: "100%" }} size={8}>
            {canPayCredits && (
              <Button
                type="primary"
                size="large"
                loading={payingCreditsId === selectedInvoiceId}
                onClick={handlePayCredits}
                style={{ borderRadius: 12, fontWeight: 700, width: "100%" }}
              >
                {L.btn_pay_credits(creditDays)}
              </Button>
            )}
            <Button
              size="large"
              loading={buyingId === selectedInvoiceId}
              onClick={handleBuyFiat}
              style={{
                borderRadius: 12,
                fontWeight: 700,
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
              }}
            >
              {L.btn_pay} · {payPrice.toFixed(0)} {payCurrency}
            </Button>
          </Space>
        </div>
      )}

      <Modal
        open={!!invoice}
        onCancel={() => setInvoice(null)}
        footer={null}
        centered
        title={<Text strong style={{ color: "#fff" }}>{L.invoice_title}</Text>}
      >
        {invoice && (
          <Space direction="vertical" style={{ width: "100%" }} size={16}>
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: "rgba(255,255,255,0.5)" }}>{L.to_pay}</Text>
                <Text strong style={{ color: "#9DB8FF", fontSize: 20 }}>
                  {invoice.amount.toFixed(0)} {invoice.currency}
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              block
              size="large"
              onClick={() => {
                window.open(invoice.url, "_blank");
                setInvoice(null);
              }}
              style={{ height: 48, borderRadius: 12, fontWeight: 600 }}
            >
              {L.btn_proceed}
            </Button>
          </Space>
        )}
      </Modal>
    </div>
  );
}
