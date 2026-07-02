import LegalLayout from "../../components/LegalLayout";
import { getLegalDoc } from "./content";
import { useLang } from "../../locale";

export default function PolicyPage() {
  const { lang } = useLang();
  return <LegalLayout doc={getLegalDoc("policy", lang)} />;
}
