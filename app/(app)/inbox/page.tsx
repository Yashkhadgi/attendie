import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

export default async function InboxPage() {
  await requireSession("/inbox");
  return <PhasePlaceholder title="Inbox" phase="Phase 5" />;
}
