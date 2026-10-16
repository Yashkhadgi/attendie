import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

export default async function ReportsPage() {
  await requireSession("/reports");
  return <PhasePlaceholder title="Reports" phase="Phase 4" />;
}
