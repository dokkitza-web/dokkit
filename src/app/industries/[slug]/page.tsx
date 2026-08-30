import { permanentRedirect } from "next/navigation";

export default function LegacyIndustryPage() {
  permanentRedirect("/packages");
}
