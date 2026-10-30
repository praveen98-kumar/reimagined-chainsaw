import { AppShell } from "@/components/v2/AppShell";
import { IMAGES } from "@/constants/images";
import { DailyQuestionsView } from "./_components/daily-questions-view";
import { DAILY_QUESTIONS } from "./_constants/daily-questions.constants";

export default function DailyQuestionsPage() {
  return (
    <AppShell title="Daily Questions" icon={IMAGES.questions}>
      <div className="p-4 space-y-4">
        <DailyQuestionsView questions={DAILY_QUESTIONS} />
      </div>
    </AppShell>
  );
}
