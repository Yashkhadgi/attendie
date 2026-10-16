import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

export default async function NotificationsPage() {
  await requireSession("/notifications");
  return <PhasePlaceholder title="Notifications" phase="Phase 5" />;
}
