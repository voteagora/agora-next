export const dynamic = "force-dynamic";

import { Card, CardContent } from "@/components/ui/card";
import {
  getArchivedForumTopics,
  getArchivedForumAttachments,
  getArchivedForumCategories,
} from "@/lib/actions/forum";
import {
  transformForumTopics,
  ForumTopic,
  ForumCategory,
} from "@/lib/forumUtils";
import { DUNA_CATEGORY_ID } from "@/lib/constants";
import ArchivedReportsSection from "@/components/Admin/ArchivedReportsSection";
import ArchivedDocumentsSection from "@/components/Admin/ArchivedDocumentsSection";
import ArchivedCategoriesSection from "@/components/Admin/ArchivedCategoriesSection";

export default async function ArchivedDataPage() {
  let archivedReports: ForumTopic[] = [];
  let archivedDocuments: any[] = [];
  let archivedCategories: ForumCategory[] = [];

  try {
    const [topicsResult, documentsResult, categoriesResult] = await Promise.all(
      [
        getArchivedForumTopics(DUNA_CATEGORY_ID),
        getArchivedForumAttachments(),
        getArchivedForumCategories(),
      ]
    );

    if (topicsResult.success) {
      archivedReports = transformForumTopics(topicsResult.data, {
        mergePostAttachments: true,
      });
    }

    if (documentsResult.success) {
      archivedDocuments = documentsResult.data;
    }

    if (categoriesResult.success) {
      archivedCategories = categoriesResult.data.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description || undefined,
        archived: category.archived,
        adminOnlyTopics: category.adminOnlyTopics,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }));
    }
  } catch (error) {
    console.error("Error fetching archived data:", error);
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-primary">
          Archived Data Administration
        </h3>
      </div>

      <Card className="border border-line bg-white shadow-sm">
        <CardContent className="p-6">
          <ArchivedReportsSection initialReports={archivedReports} />
          <div className="mt-8 pt-6 border-t border-line">
            <ArchivedCategoriesSection initialCategories={archivedCategories} />
          </div>
          <div className="mt-8 pt-6 border-t border-line">
            <ArchivedDocumentsSection initialDocuments={archivedDocuments} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
