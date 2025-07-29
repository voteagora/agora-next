import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import QuarterlyReportsSection from "./QuarterlyReportsSection";
import DocumentsSection from "./DocumentsSection";
import { getForumTopics } from "@/lib/actions/forum";

const DUNA_CATEGORY_ID = 1;

interface Report {
  id: number;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  comments: any[];
  attachments: any[];
}

function transformForumTopics(data: any[]): Report[] {
  return data.map((topic: any) => {
    const topicAttachments = topic.attachments || [];
    const postAttachments =
      topic.posts?.flatMap((post: any) => post.attachments || []) || [];
    const allAttachments = [...topicAttachments, ...postAttachments];

    return {
      id: topic.id,
      title: topic.title,
      author: topic.address,
      content: topic.posts?.[0]?.content || "",
      createdAt: topic.createdAt,
      comments: topic.posts?.slice(1) || [],
      attachments: allAttachments,
    };
  });
}

const DunaAdministration = async () => {
  let dunaReports: Report[] = [];
  try {
    const topicsResult = await getForumTopics(DUNA_CATEGORY_ID);
    if (topicsResult.success) {
      dunaReports = transformForumTopics(topicsResult.data);
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
          <div className="border-t border-line mt-8 pt-8">
            <DocumentsSection />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DunaAdministration;
