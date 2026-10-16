import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

export default async function PickerPage() {
  await requireSession("/picker");
  return <PhasePlaceholder title="Directory Picker" phase="Phase 8" />;
}
