import { Alert, App, Badge, Button, Card, Form, Input, Space, Spin, Tag, Typography } from "antd";
import {
  ArrowLeftOutlined,
  CustomerServiceOutlined,
  PlusOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { ApiError, support, TicketDetail, TicketSummary } from "../../api/client";
import { useLang } from "../../locale";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type SupportView = "list" | "create" | "detail";

const STATUS_COLORS: Record<string, string> = {
  open: "processing",
  in_progress: "warning",
  closed: "default",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function SupportTab() {
  const { message: msg } = App.useApp();
  const { L } = useLang();

  const [view, setView] = useState<SupportView>("list");
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [createForm] = Form.useForm();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function statusLabel(s: string): string {
    if (s === "open") return L.ticket_status_open;
    if (s === "in_progress") return L.ticket_status_in_progress;
    if (s === "closed") return L.ticket_status_closed;
    return s;
  }

  async function loadTickets() {
    setListLoading(true);
    try {
      const list = await support.listTickets();
      setTickets(list);
    } catch {
      msg.error(L.err_load_tickets);
    } finally {
      setListLoading(false);
    }
  }

  async function openTicket(id: number) {
    setDetailLoading(true);
    setView("detail");
    try {
      const t = await support.getTicket(id);
      setTicket(t);
    } catch {
      msg.error(L.err_load_ticket);
      setView("list");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreate(values: { subject: string; message: string }) {
    setCreateLoading(true);
    try {
      const t = await support.createTicket(values.subject, values.message);
      createForm.resetFields();
      setTicket(t);
      setView("detail");
      await loadTickets();
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        msg.error(L.err_too_many_tickets);
      } else {
        msg.error(L.err_create_ticket);
      }
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleReply() {
    const text = replyText.trim();
    if (!text || !ticket) return;
    setReplyLoading(true);
    try {
      const newMsg = await support.addMessage(ticket.id, text);
      setReplyText("");
      setTicket((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev
      );
    } catch {
      msg.error(L.err_send_reply);
    } finally {
      setReplyLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (view === "detail" && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.messages?.length, view]);

  /* ── Ticket list ─────────────────────────────────────────────────────── */
  if (view === "list") {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            <CustomerServiceOutlined style={{ marginRight: 8 }} />{L.support_title}
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setView("create")}
            style={{ background: "linear-gradient(135deg, #7C9CFF, #B47CFF)", border: "none", borderRadius: 10 }}
          >
            {L.btn_new_ticket}
          </Button>
        </div>

        {listLoading ? (
          <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <CustomerServiceOutlined style={{ fontSize: 48, color: "rgba(255,255,255,0.2)", marginBottom: 16 }} />
            <br />
            <Text style={{ color: "rgba(255,255,255,0.4)" }}>{L.ticket_list_empty}</Text>
          </div>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size={12}>
            {tickets.map((t) => (
              <Card
                key={t.id}
                hoverable
                onClick={() => openTicket(t.id)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 14,
                  cursor: "pointer",
                }}
                styles={{ body: { padding: "14px 18px" } }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ color: "#fff", display: "block", marginBottom: 4 }}>
                      {t.subject}
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>
                      {t.last_message_preview}
                    </Text>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <Badge
                      status={STATUS_COLORS[t.status] as any}
                      text={<Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{statusLabel(t.status)}</Text>}
                    />
                    <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{formatDate(t.updated_at)}</Text>
                  </div>
                </div>
              </Card>
            ))}
          </Space>
        )}
      </div>
    );
  }

  /* ── Create ticket ───────────────────────────────────────────────────── */
  if (view === "create") {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => setView("list")}
            style={{ color: "rgba(255,255,255,0.6)", padding: "4px 8px" }}
          />
          <Title level={4} style={{ color: "#fff", margin: 0 }}>
            {L.btn_new_ticket}
          </Title>
        </div>

        <Card
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16 }}
          styles={{ body: { padding: 24 } }}
        >
          <Form form={createForm} layout="vertical" onFinish={handleCreate}>
            <Form.Item
              name="subject"
              label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.ticket_subject_label}</Text>}
              rules={[{ required: true, message: L.val_subject_req }, { max: 200 }]}
            >
              <Input
                placeholder={L.ticket_subject_placeholder}
                maxLength={200}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff" }}
              />
            </Form.Item>
            <Form.Item
              name="message"
              label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.ticket_message_label}</Text>}
              rules={[{ required: true, message: L.val_message_req }, { max: 4000 }]}
            >
              <TextArea
                placeholder={L.ticket_message_placeholder}
                rows={5}
                maxLength={4000}
                showCount
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, color: "#fff", resize: "none" }}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createLoading}
              icon={<SendOutlined />}
              style={{ background: "linear-gradient(135deg, #7C9CFF, #B47CFF)", border: "none", borderRadius: 10 }}
            >
              {L.btn_send_ticket}
            </Button>
          </Form>
        </Card>
      </div>
    );
  }

  /* ── Ticket detail / thread ──────────────────────────────────────────── */
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => { setView("list"); setTicket(null); }}
          style={{ color: "rgba(255,255,255,0.6)", padding: "4px 8px" }}
        />
        <div style={{ flex: 1 }}>
          {ticket && (
            <>
              <Text strong style={{ color: "#fff", display: "block" }}>{ticket.subject}</Text>
              <Tag color={STATUS_COLORS[ticket.status]} style={{ marginTop: 2 }}>
                {statusLabel(ticket.status)}
              </Tag>
            </>
          )}
        </div>
      </div>

      {detailLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>
      ) : ticket ? (
        <>
          {/* Messages */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            padding: 16,
            marginBottom: 16,
            maxHeight: 480,
            overflowY: "auto",
          }}>
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
              {ticket.messages.map((m) => {
                const isUser = m.sender === "user";
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isUser ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      {!isUser && <CustomerServiceOutlined style={{ color: "#7C9CFF", fontSize: 13 }} />}
                      <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                        {isUser ? L.lbl_you : L.lbl_support_agent} · {formatDate(m.created_at)}
                      </Text>
                      {isUser && <UserOutlined style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }} />}
                    </div>
                    <div style={{
                      background: isUser ? "rgba(6,214,160,0.15)" : "rgba(255,255,255,0.07)",
                      border: `1px solid ${isUser ? "rgba(6,214,160,0.25)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      padding: "8px 14px",
                      maxWidth: "80%",
                    }}>
                      <Paragraph style={{ color: "#fff", margin: 0, whiteSpace: "pre-wrap", fontSize: 14 }}>
                        {m.text}
                      </Paragraph>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </Space>
          </div>

          {/* Reply input */}
          {ticket.status !== "closed" ? (
            <Space.Compact style={{ width: "100%" }}>
              <TextArea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={L.reply_placeholder}
                autoSize={{ minRows: 1, maxRows: 4 }}
                maxLength={4000}
                onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleReply(); } }}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px 0 0 10px",
                  color: "#fff",
                  resize: "none",
                }}
                disabled={replyLoading}
              />
              <Button
                type="primary"
                loading={replyLoading}
                onClick={handleReply}
                icon={<SendOutlined />}
                style={{
                  background: "linear-gradient(135deg, #7C9CFF, #B47CFF)",
                  border: "none",
                  borderRadius: "0 10px 10px 0",
                  height: "auto",
                  alignSelf: "stretch",
                }}
              >
                {L.btn_send_reply}
              </Button>
            </Space.Compact>
          ) : (
            <Alert
              message={L.ticket_status_closed}
              type="info"
              style={{ borderRadius: 10 }}
              showIcon
            />
          )}
        </>
      ) : null}
    </div>
  );
}
