import { Suspense } from "react";

import { PhasePlaceholder } from "@/components/PhasePlaceholder";
import { requireSession } from "@/lib/auth/guards";

async function ProtectedPicker() {
  await requireSession("/picker");
  return <PhasePlaceholder title="Directory Picker" phase="Phase 8" />;
}

export default function PickerPage() {
  return (
    <Suspense fallback={null}>
      <ProtectedPicker />
    </Suspense>
  );
}
