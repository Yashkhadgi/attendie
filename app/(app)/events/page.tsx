import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

export default async function EventsPage() {
  await requireSession("/events");
  return <PhasePlaceholder title="Events" phase="Phase 4" />;
}
