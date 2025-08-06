import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import QuarterlyReportsSection from "./QuarterlyReportsSection";
import DocumentsSection from "./DocumentsSection";
import { getForumTopics } from "@/lib/actions/forum";
import { transformForumTopics, ForumTopic } from "@/lib/forumUtils";
import { DUNA_CATEGORY_ID } from "@/lib/constants";

const DunaAdministration = async () => {
  let dunaReports: ForumTopic[] = [];
  try {
    const topicsResult = await getForumTopics(DUNA_CATEGORY_ID);
    if (topicsResult.success) {
      dunaReports = transformForumTopics(topicsResult.data, {
        mergePostAttachments: true,
      });
    }
  } catch (error) {
    console.error("Error fetching forum topics:", error);
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-primary">
          DUNA Administration
        </h3>
      </div>

      <Card className="border border-line bg-white shadow-sm">
        <CardContent className="p-6">
          <QuarterlyReportsSection initialReports={dunaReports} />
          <div className="mt-4 pt-4">
            <DocumentsSection />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DunaAdministration;
