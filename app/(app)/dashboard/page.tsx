import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

export default async function DashboardPage() {
  const session = await requireSession("/dashboard");

  return (
    <PhasePlaceholder
      title={`Welcome, ${session.claims.name}`}
      phase="Phase 2"
      description={`Signed in through EkLink as ${session.claims.role}.`}
    />
  );
}
