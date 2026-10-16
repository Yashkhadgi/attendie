import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

export default async function RolesPage() {
  await requireSession("/admin/roles");
  return <PhasePlaceholder title="Roles" phase="Phase 3" />;
}
