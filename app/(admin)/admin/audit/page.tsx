import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

export default async function AuditPage() {
  await requireSession("/admin/audit");
  return <PhasePlaceholder title="Audit" phase="Phase 7" />;
}
