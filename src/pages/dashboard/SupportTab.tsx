import {
  ArrowLeft,
  Headset,
  Paperclip,
  Plus,
  Send,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { AttachmentOut, ApiError, support, TicketDetail, TicketSummary } from "../../api/client";
import { useAuthedImage } from "../../hooks/useAuthedImage";
import { useLang } from "../../locale";

const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function AttachmentThumb({ attachment }: { attachment: AttachmentOut }) {
  const objectUrl = useAuthedImage(attachment.url);
  if (!objectUrl) {
    return <div className="h-[88px] w-[88px] rounded-lg bg-secondary" />;
  }
  return (
    <a href={objectUrl} target="_blank" rel="noreferrer">
      <img src={objectUrl} width={88} height={88} className="rounded-lg object-cover" />
    </a>
  );
}

type SupportView = "list" | "create" | "detail";

const STATUS_BADGE: Record<string, "default" | "warning" | "secondary"> = {
  open: "default",
  in_progress: "warning",
  closed: "secondary",
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
  const { L } = useLang();

  const [view, setView] = useState<SupportView>("list");
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [pendingImages, setPendingImages] = useState<File[]>([]);

  const createSchema = z.object({
    subject: z.string().min(1, L.val_subject_req).max(200),
    message: z.string().min(1, L.val_message_req).max(4000),
  });
  const createForm = useForm<z.infer<typeof createSchema>>({ resolver: zodResolver(createSchema) });
  const messageVal = createForm.watch("message") || "";

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingPreviewUrls = useMemo(
    () => pendingImages.map((f) => URL.createObjectURL(f)),
    [pendingImages],
  );
  useEffect(() => {
    return () => pendingPreviewUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [pendingPreviewUrls]);

  function onFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);
    const combined = [...pendingImages, ...incoming];
    if (combined.length > MAX_IMAGES) {
      toast.error(L.err_too_many_images);
      return;
    }
    for (const f of incoming) {
      if (f.size > MAX_IMAGE_BYTES) {
        toast.error(L.err_image_too_large);
        return;
      }
    }
    setPendingImages(combined);
  }

  function removePendingImage(idx: number) {
    setPendingImages((prev) => prev.filter((_, i) => i !== idx));
  }

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
      toast.error(L.err_load_tickets);
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
      toast.error(L.err_load_ticket);
      setView("list");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreate(values: z.infer<typeof createSchema>) {
    setCreateLoading(true);
    try {
      const t = await support.createTicket(values.subject, values.message);
      createForm.reset();
      setTicket(t);
      setView("detail");
      await loadTickets();
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        toast.error(L.err_too_many_tickets);
      } else {
        toast.error(L.err_create_ticket);
      }
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleReply() {
    const text = replyText.trim();
    if (!ticket || (!text && pendingImages.length === 0)) return;
    setReplyLoading(true);
    try {
      const newMsg = await support.addMessage(ticket.id, text, pendingImages);
      setReplyText("");
      setPendingImages([]);
      setTicket((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev
      );
    } catch {
      toast.error(L.err_send_reply);
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
        <div className="mb-6 flex items-center justify-between">
          <h4 className="m-0 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Headset size={18} />{L.support_title}
          </h4>
          <Button onClick={() => setView("create")} className="gap-2 rounded-lg">
            <Plus size={16} />
            {L.btn_new_ticket}
          </Button>
        </div>

        {listLoading ? (
          <div className="py-10 text-center"><Spinner className="mx-auto h-6 w-6" /></div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <Headset className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <span className="text-muted-foreground">{L.ticket_list_empty}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((t) => (
              <Card
                key={t.id}
                onClick={() => openTicket(t.id)}
                className="cursor-pointer px-[18px] py-3.5 transition-colors hover:bg-accent"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="mb-1 block truncate font-semibold text-foreground">{t.subject}</span>
                    <span className="block truncate text-[13px] text-muted-foreground">{t.last_message_preview}</span>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                    <Badge variant={STATUS_BADGE[t.status] ?? "secondary"}>{statusLabel(t.status)}</Badge>
                    <span className="text-[11px] text-muted-foreground">{formatDate(t.updated_at)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Create ticket ───────────────────────────────────────────────────── */
  if (view === "create") {
    return (
      <div>
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView("list")} className="h-8 w-8 text-muted-foreground">
            <ArrowLeft size={18} />
          </Button>
          <h4 className="m-0 text-lg font-semibold text-foreground">{L.btn_new_ticket}</h4>
        </div>

        <Card className="p-6">
          <form onSubmit={createForm.handleSubmit(handleCreate)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{L.ticket_subject_label}</Label>
              <Input placeholder={L.ticket_subject_placeholder} maxLength={200} {...createForm.register("subject")} />
              {createForm.formState.errors.subject && (
                <span className="text-xs text-destructive">{createForm.formState.errors.subject.message}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground">{L.ticket_message_label}</Label>
              <Textarea
                placeholder={L.ticket_message_placeholder}
                rows={5}
                maxLength={4000}
                className="resize-none"
                {...createForm.register("message")}
              />
              <div className="flex items-center justify-between">
                {createForm.formState.errors.message ? (
                  <span className="text-xs text-destructive">{createForm.formState.errors.message.message}</span>
                ) : <span />}
                <span className="text-xs text-muted-foreground">{messageVal.length}/4000</span>
              </div>
            </div>
            <Button type="submit" disabled={createLoading} className="w-fit gap-2 rounded-lg">
              {createLoading ? <Spinner className="h-4 w-4" /> : <Send size={16} />}
              {L.btn_send_ticket}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  /* ── Ticket detail / thread ──────────────────────────────────────────── */
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setView("list"); setTicket(null); }}
          className="h-8 w-8 text-muted-foreground"
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="flex-1">
          {ticket && (
            <>
              <span className="block font-semibold text-foreground">{ticket.subject}</span>
              <Badge variant={STATUS_BADGE[ticket.status] ?? "secondary"} className="mt-0.5">
                {statusLabel(ticket.status)}
              </Badge>
            </>
          )}
        </div>
      </div>

      {detailLoading ? (
        <div className="py-10 text-center"><Spinner className="mx-auto h-6 w-6" /></div>
      ) : ticket ? (
        <>
          {/* Messages */}
          <div className="mb-4 max-h-[480px] overflow-y-auto rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3">
              {ticket.messages.map((m) => {
                const isUser = m.sender === "user";
                return (
                  <div key={m.id} className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
                    <div className="mb-1 flex items-center gap-1.5">
                      {!isUser && <Headset size={13} className="text-primary" />}
                      <span className="text-[11px] text-muted-foreground">
                        {isUser ? L.lbl_you : L.lbl_support_agent} · {formatDate(m.created_at)}
                      </span>
                      {isUser && <User size={13} className="text-muted-foreground" />}
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl border px-3.5 py-2",
                        isUser
                          ? "rounded-br-sm border-emerald-500/25 bg-emerald-500/[0.15]"
                          : "rounded-bl-sm border-border bg-secondary",
                      )}
                    >
                      {m.text && (
                        <p className="m-0 whitespace-pre-wrap text-sm text-foreground">{m.text}</p>
                      )}
                      {m.attachments && m.attachments.length > 0 && (
                        <div className={cn("flex flex-wrap gap-2", m.text && "mt-2")}>
                          {m.attachments.map((a) => (
                            <AttachmentThumb key={a.id} attachment={a} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Reply input */}
          {ticket.status !== "closed" ? (
            <div>
              {pendingImages.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {pendingImages.map((_f, idx) => (
                    <div key={idx} className="relative">
                      <img src={pendingPreviewUrls[idx]} width={64} height={64} className="rounded-lg object-cover" />
                      <button
                        onClick={() => removePendingImage(idx)}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  onFilesSelected(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="flex items-stretch gap-0">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={pendingImages.length >= MAX_IMAGES}
                  title={L.btn_attach_image}
                  className="rounded-r-none"
                >
                  <Paperclip size={16} />
                </Button>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={L.reply_placeholder}
                  maxLength={4000}
                  rows={1}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  disabled={replyLoading}
                  className="resize-none rounded-none"
                />
                <Button
                  onClick={handleReply}
                  disabled={replyLoading || (!replyText.trim() && pendingImages.length === 0)}
                  className="rounded-l-none"
                >
                  {replyLoading ? <Spinner className="h-4 w-4" /> : <Send size={16} />}
                </Button>
              </div>
            </div>
          ) : (
            <Alert variant="info" className="rounded-lg">
              <AlertDescription>{L.ticket_status_closed}</AlertDescription>
            </Alert>
          )}
        </>
      ) : null}
    </div>
  );
}
