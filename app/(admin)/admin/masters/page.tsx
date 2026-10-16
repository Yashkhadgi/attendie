import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

export default async function MastersPage() {
  await requireSession("/admin/masters");
  return <PhasePlaceholder title="Masters" phase="Phase 4" />;
}
