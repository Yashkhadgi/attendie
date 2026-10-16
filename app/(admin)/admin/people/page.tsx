import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

export default async function PeoplePage() {
  await requireSession("/admin/people");
  return <PhasePlaceholder title="People" phase="Phase 3" />;
}
