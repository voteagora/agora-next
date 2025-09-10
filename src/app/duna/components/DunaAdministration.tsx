import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import QuarterlyReportsSection from "./QuarterlyReportsSection";
import DocumentsSection from "./DocumentsSection";
import { getForumTopics, getDunaCategoryId } from "@/lib/actions/forum";
import { transformForumTopics, ForumTopic } from "@/lib/forumUtils";

const DunaAdministration = async () => {
  let dunaReports: ForumTopic[] = [];
  let documents: any[] = [];
  
  try {
    const dunaCategoryId = await getDunaCategoryId();
    if (!dunaCategoryId) {
      console.error("Could not find DUNA category ID");
      return (
        <div className="mt-12">
          <div className="text-center py-8 text-red-500">
            Error: Could not find DUNA category
          </div>
        </div>
      );
    }
    const topicsResult = await getForumTopics(dunaCategoryId);
    if (topicsResult.success) {
      dunaReports = transformForumTopics(topicsResult.data, {
        mergePostAttachments: true,
      });
    }
  } catch (error) {
    console.error("Error fetching forum data:", error);
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
            <DocumentsSection initialDocuments={documents} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DunaAdministration;
