import { Alert, Button, Modal, Skeleton, Space, Tag, Typography } from "antd";
import { CheckOutlined, GiftOutlined, ShoppingCartOutlined } from "@ant-design/icons";
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
  const [discountPct, setDiscountPct] = useState(0);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<(number | null)[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [invoice, setInvoice] = useState<WebInvoiceResponse | null>(null);

  // derive current language from the toggle label ("RU" = currently EN, "EN" = currently RU)
  const isRu = L.lang_toggle === "EN";

  const chipLabel = (depth: number) => {
    if (isRu) return depth === 0 ? "Тариф" : depth === 1 ? "Период" : "Подкатегория";
    return depth === 0 ? "Tariff" : depth === 1 ? "Period" : "Subcategory";
  };
  const invoiceLabel = isRu ? "Метод оплаты" : "Payment method";
  const selectHint = isRu ? "Выберите категорию выше" : "Select a category above";
  const noTariffsHint = isRu ? "Тарифы не найдены" : "No tariffs found";
  const payLabel = isRu ? "Оплатить" : "Pay";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await webPayments.getMenu();
      setTree(resp.tree);
      setDiscountPct(resp.discount_percent);
      setPromoCode(resp.promo_code);
    } catch {
      setError(L.err_load_plans);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const { chipLevels, invoices } = useMemo(() => {
    if (!tree.length) return { chipLevels: [], invoices: [] };
    return buildView(tree, selections);
  }, [tree, selections]);

  const selectedInvoice = useMemo(
    () => invoices.find((n) => n.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId]
  );

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

  async function handleBuy() {
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
  const payOrig = payInvoice?.amount ?? 0;
  const payDiscounted = discountPct > 0 && payInvoice
    ? Math.round(payOrig * (1 - discountPct / 100) * 100) / 100
    : null;
  const payPrice = payDiscounted ?? payOrig;
  const payCurrency = payInvoice?.currency ?? "";

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <ShoppingCartOutlined style={{ fontSize: 18, color: "rgba(255,255,255,0.5)" }} />
        <Title level={4} style={{ color: "#fff", margin: 0 }}>{L.buy_title}</Title>
      </div>

      {/* Promo alert */}
      {promoCode && discountPct > 0 && (
        <Alert
          icon={<GiftOutlined />}
          type="success"
          showIcon
          message={
            <Space>
              <span>{L.promo_active}</span>
              <Tag color="green">{promoCode}</Tag>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{L.promo_applied(discountPct)}</span>
            </Space>
          }
          style={{ borderRadius: 12, marginBottom: 20 }}
        />
      )}

      {/* No tariffs */}
      {chipLevels.length === 0 && invoices.length === 0 && (
        <div className="tariff-hint">{noTariffsHint}</div>
      )}

      {/* Chip selection rows */}
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

      {/* Hint: need to select a category */}
      {chipLevels.length > 0 && invoices.length === 0 && (
        <div className="tariff-hint">{selectHint}</div>
      )}

      {/* Invoice cards (payment method selection) */}
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
                const origAmt = inv.original_amount ?? inv.amount;
                const hasDiscount = discountPct > 0 && origAmt > inv.amount;
                const isSelected = selectedInvoiceId === n.id;

                return (
                  <div
                    key={n.id}
                    className={`tariff-card${isSelected ? " selected" : ""}`}
                    onClick={() => selectInvoice(n.id)}
                  >
                    <div className="tariff-card__name">{n.text}</div>
                    <div className="tariff-card__price-row">
                      {hasDiscount && (
                        <div className="tariff-card__price-orig">
                          {origAmt.toFixed(0)} {inv.currency}
                        </div>
                      )}
                      <div className="tariff-card__price">{inv.amount.toFixed(0)}</div>
                      <div className="tariff-card__currency">{inv.currency}</div>
                    </div>
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

      {/* Inline pay section */}
      {selectedInvoice && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
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
              {payDiscounted !== null && (
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.30)", textDecoration: "line-through" }}>
                  {payOrig.toFixed(0)}
                </span>
              )}
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            loading={!!buyingId}
            onClick={handleBuy}
            style={{ borderRadius: 12, fontWeight: 700, paddingLeft: 28, paddingRight: 28 }}
          >
            {payLabel}
          </Button>
        </div>
      )}

      {/* Invoice confirm modal */}
      <Modal
        open={!!invoice}
        onCancel={() => setInvoice(null)}
        footer={null}
        centered
        title={<Text strong style={{ color: "#fff" }}>{L.invoice_title}</Text>}
      >
        {invoice && (
          <Space direction="vertical" style={{ width: "100%" }} size={16}>
            {invoice.discount_percent > 0 && (
              <Alert
                icon={<GiftOutlined />}
                type="success"
                message={L.discount_applied_msg(invoice.discount_percent)}
                showIcon
                style={{ borderRadius: 10 }}
              />
            )}
            <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: "rgba(255,255,255,0.5)" }}>{L.to_pay}</Text>
                <Text strong style={{ color: "#9DB8FF", fontSize: 20 }}>
                  {invoice.amount.toFixed(0)} {invoice.currency}
                </Text>
              </div>
              {invoice.discount_percent > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{L.without_discount}</Text>
                  <Text delete style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                    {invoice.original_amount.toFixed(0)} {invoice.currency}
                  </Text>
                </div>
              )}
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
