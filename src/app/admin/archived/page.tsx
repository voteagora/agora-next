export const dynamic = "force-dynamic";

import { Card, CardContent } from "@/components/ui/card";
import {
  getArchivedForumTopics,
  getArchivedForumAttachments,
  getDunaCategoryId,
} from "@/lib/actions/forum";
import { transformForumTopics, ForumTopic } from "@/lib/forumUtils";
import ArchivedReportsSection from "@/components/Admin/ArchivedReportsSection";
import ArchivedDocumentsSection from "@/components/Admin/ArchivedDocumentsSection";
import Tenant from "@/lib/tenant/tenant";

export default async function ArchivedDataPage() {
  const { ui } = Tenant.current();

  let archivedReports: ForumTopic[] = [];
  let archivedDocuments: any[] = [];

  if (!ui.toggle("forum") && !ui.toggle("duna")) {
    return <div>Route not supported for namespace</div>;
  }

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

    const [topicsResult, documentsResult] = await Promise.all([
      getArchivedForumTopics(dunaCategoryId!),
      getArchivedForumAttachments(),
    ]);

    if (topicsResult.success) {
      archivedReports = transformForumTopics(topicsResult.data, {
        mergePostAttachments: true,
      });
    }

    if (documentsResult.success) {
      archivedDocuments = documentsResult.data;
    }
  } catch (error) {
    console.error("Error fetching archived data:", error);
  }

  return (
    <div className={`mt-12`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-primary">
          Archived Data Administration
        </h3>
      </div>

      <Card
        className={`border shadow-sm ${
          ui.customization?.cardBackground
            ? "bg-cardBackground border-cardBorder"
            : "bg-white border-line"
        }`}
      >
        <CardContent className="p-6">
          <ArchivedReportsSection initialReports={archivedReports} />
          <div
            className={`mt-8 pt-6 border-t ${
              ui.customization?.cardBorder ? "border-cardBorder" : "border-line"
            }`}
          >
            <ArchivedDocumentsSection initialDocuments={archivedDocuments} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
