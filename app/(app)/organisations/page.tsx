import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

export default async function OrganisationsPage() {
  await requireSession("/organisations");
  return <PhasePlaceholder title="Organisations" phase="Phase 6" />;
}
