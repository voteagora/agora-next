import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import DocumentsSection from "./DocumentsSection";
import {
  getDunaCategoryId,
  getForumCategoryAttachments,
} from "@/lib/actions/forum";

const DunaAdministrationArchive = async () => {
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
    const documentsResult = await getForumCategoryAttachments({
      categoryId: dunaCategoryId,
      archived: true,
    });

    if (documentsResult.success) {
      documents = documentsResult.data;
    }
  } catch (error) {
    console.error("Error fetching forum data:", error);
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-primary">
          DUNA Document Archive
        </h3>
      </div>

      <div className="mb-4">
        <h4 className="text-lg font-semibold text-primary">
          Formation Documents
        </h4>
      </div>

      <Card className="border border-line bg-cardBackground shadow-sm">
        <CardContent className="p-6">
          <div className="">
            <DocumentsSection
              initialDocuments={documents}
              hideHeader={true}
              hideComms={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DunaAdministrationArchive;
