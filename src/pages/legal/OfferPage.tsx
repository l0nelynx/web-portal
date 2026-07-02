import LegalLayout from "../../components/LegalLayout";
import { getLegalDoc } from "./content";
import { useLang } from "../../locale";

export default function OfferPage() {
  const { lang } = useLang();
  return <LegalLayout doc={getLegalDoc("offer", lang)} />;
}
