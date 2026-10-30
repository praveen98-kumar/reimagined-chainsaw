"use client";

import { useState } from "react";
import { Tabs, TabsContent } from "@/components/v2/ui/tabs";
import type { QuestionTab } from "../_types/manage-questions.types";
import { CreateTab } from "./create-tab";
import { DraftsTab } from "./drafts-tab";
import { HistoryTab } from "./history-tab";
import { PublishedTab } from "./published-tab";
import { QuestionTabs } from "./question-tabs";

export function ManageQuestionsView() {
  const [tab, setTab] = useState<QuestionTab>("create");

  return (
    <Tabs
      value={tab}
      onValueChange={(value: QuestionTab) => setTab(value)}
      className="flex-col"
    >
      <QuestionTabs />
      <TabsContent value="create">
        <CreateTab />
      </TabsContent>
      <TabsContent value="drafts">
        <DraftsTab />
      </TabsContent>
      <TabsContent value="published">
        <PublishedTab />
      </TabsContent>
      <TabsContent value="history">
        <HistoryTab />
      </TabsContent>
    </Tabs>
  );
}
