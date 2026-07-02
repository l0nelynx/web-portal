import LegalLayout from "../../components/LegalLayout";
import { getLegalDoc } from "./content";
import { useLang } from "../../locale";

export default function AgreementPage() {
  const { lang } = useLang();
  return <LegalLayout doc={getLegalDoc("agreement", lang)} />;
}
