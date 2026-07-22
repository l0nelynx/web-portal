import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { partnership } from "../api/client";
import { useLang } from "../locale";

function buildSchema(L: ReturnType<typeof useLang>["L"]) {
  return z.object({
    goal: z.string().trim().min(1, L.val_partner_goal).max(200),
    description: z.string().trim().min(1, L.val_partner_desc).max(2000),
    contact: z.string().trim().min(1, L.val_partner_contact).max(200),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export default function PartnershipForm() {
  const { L } = useLang();
  const schema = buildSchema(L);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const descLen = watch("description")?.length ?? 0;

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await partnership.submit(values);
      setSent(true);
      reset();
    } catch {
      setError(L.partner_error);
    }
  }

  if (sent) {
    return (
      <Alert variant="success" className="rounded-xl">
        <AlertDescription className="flex items-center justify-between gap-3">
          <span>{L.partner_success}</span>
          <Button size="sm" variant="ghost" className="text-primary" onClick={() => setSent(false)}>
            +
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive" className="rounded-lg">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground">{L.partner_goal_label}</Label>
        <Input placeholder={L.partner_goal_ph} maxLength={200} {...register("goal")} />
        {errors.goal && <p className="text-xs text-destructive">{errors.goal.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground">{L.partner_desc_label}</Label>
        <Textarea
          placeholder={L.partner_desc_ph}
          rows={4}
          maxLength={2000}
          className="resize-none"
          {...register("description")}
        />
        <div className="flex items-center justify-between">
          {errors.description ? (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">{descLen} / 2000</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-muted-foreground">{L.partner_contact_label}</Label>
        <Input placeholder={L.partner_contact_ph} maxLength={200} {...register("contact")} />
        {errors.contact && <p className="text-xs text-destructive">{errors.contact.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 self-start rounded-xl px-8 font-semibold"
      >
        <Send className="h-4 w-4" />
        {L.partner_submit}
      </Button>
    </form>
  );
}
