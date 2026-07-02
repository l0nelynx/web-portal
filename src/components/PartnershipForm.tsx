import { Alert, Button, Form, Input, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useState } from "react";
import { partnership } from "../api/client";
import { useLang } from "../locale";

const { Text } = Typography;
const { TextArea } = Input;

interface FormValues {
  goal: string;
  description: string;
  contact: string;
}

const fieldStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  color: "#fff",
};

export default function PartnershipForm() {
  const { L } = useLang();
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFinish(values: FormValues) {
    setLoading(true);
    setError(null);
    try {
      await partnership.submit({
        goal: values.goal.trim(),
        description: values.description.trim(),
        contact: values.contact.trim(),
      });
      setSent(true);
      form.resetFields();
    } catch {
      setError(L.partner_error);
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <Alert
        type="success"
        showIcon
        message={L.partner_success}
        style={{ borderRadius: 12 }}
        action={
          <Button size="small" type="text" onClick={() => setSent(false)} style={{ color: "#7C9CFF" }}>
            +
          </Button>
        }
      />
    );
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}
      <Form.Item
        name="goal"
        label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.partner_goal_label}</Text>}
        rules={[{ required: true, message: L.val_partner_goal }, { max: 200 }]}
      >
        <Input placeholder={L.partner_goal_ph} maxLength={200} style={fieldStyle} />
      </Form.Item>

      <Form.Item
        name="description"
        label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.partner_desc_label}</Text>}
        rules={[{ required: true, message: L.val_partner_desc }, { max: 2000 }]}
      >
        <TextArea
          placeholder={L.partner_desc_ph}
          rows={4}
          maxLength={2000}
          showCount
          style={{ ...fieldStyle, resize: "none" }}
        />
      </Form.Item>

      <Form.Item
        name="contact"
        label={<Text style={{ color: "rgba(255,255,255,0.7)" }}>{L.partner_contact_label}</Text>}
        rules={[{ required: true, message: L.val_partner_contact }, { max: 200 }]}
      >
        <Input placeholder={L.partner_contact_ph} maxLength={200} style={fieldStyle} />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        icon={<SendOutlined />}
        size="large"
        style={{
          background: "linear-gradient(135deg, #7C9CFF, #B47CFF)",
          border: "none",
          borderRadius: 12,
          height: 48,
          padding: "0 32px",
          fontWeight: 600,
        }}
      >
        {L.partner_submit}
      </Button>
    </Form>
  );
}
