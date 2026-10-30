import { AppShell } from "@/components/v2/AppShell";
import { IMAGES } from "@/constants/images";
import { ManageQuestionsView } from "./_components/manage-questions-view";

export default function ManageQuestionsPage() {
  return (
    <AppShell title="Manage Questions" icon={IMAGES.questions}>
      <div className="p-4 space-y-4">
        <ManageQuestionsView />
      </div>
    </AppShell>
  );
}
