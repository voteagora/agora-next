export const dynamic = "force-dynamic";

import { Card, CardContent } from "@/components/ui/card";
import {
  getArchivedForumTopics,
  getArchivedForumAttachments,
  getArchivedForumCategories,
  getDunaCategoryId,
} from "@/lib/actions/forum";
import {
  transformForumTopics,
  ForumTopic,
  ForumCategory,
} from "@/lib/forumUtils";
import ArchivedReportsSection from "@/components/Admin/ArchivedReportsSection";
import ArchivedDocumentsSection from "@/components/Admin/ArchivedDocumentsSection";
import ArchivedCategoriesSection from "@/components/Admin/ArchivedCategoriesSection";
import Tenant from "@/lib/tenant/tenant";

export default async function ArchivedDataPage() {
  const { ui } = Tenant.current();

  let archivedReports: ForumTopic[] = [];
  let archivedDocuments: any[] = [];
  let archivedCategories: ForumCategory[] = [];

  if (!ui.toggle("forum") && !ui.toggle("duna")) {
    return <div>Route not supported for namespace</div>;

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

    const [topicsResult, documentsResult, categoriesResult] = await Promise.all(
      [
        getArchivedForumTopics(dunaCategoryId),
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
      archivedCategories = categoriesResult.data.map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description || undefined,
        archived: category.archived ?? false,
        adminOnlyTopics: category.adminOnlyTopics ?? false,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      }));
    }
  } catch (error) {
    console.error("Error fetching archived data:", error);
  }

  return (
    <div className={`mt-12 ${isTowns ? "towns-tenant" : ""}`}>
      <div className="flex items-center justify-between mb-6">
        <h3
          className={`text-2xl font-black ${
            isTowns ? "text-white" : "text-primary"
          }`}
        >
          Archived Data Administration
        </h3>
      </div>

      <Card
        className={`border shadow-sm ${
          isTowns ? "bg-[#1E1A2F] border-[#2B2449]" : "bg-white border-line"
        }`}
      >
        <CardContent className="p-6">
          <ArchivedReportsSection initialReports={archivedReports} />
          {/* <div
            className={`mt-8 pt-6 border-t ${
              isTowns ? "border-[#2B2449]" : "border-line"
            }`}
          >
            <ArchivedCategoriesSection initialCategories={archivedCategories} />
          </div> */}
          <div
            className={`mt-8 pt-6 border-t ${
              isTowns ? "border-[#2B2449]" : "border-line"
            }`}
          >
            <ArchivedDocumentsSection initialDocuments={archivedDocuments} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
