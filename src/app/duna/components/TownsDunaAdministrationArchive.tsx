import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import DocumentsSection from "./DocumentsSection";
import {
  getForumAttachments,
  getDunaCategoryId,
  getForumCategoryAttachments,
} from "@/lib/actions/forum";

const TownsDunaAdministrationArchive = async () => {
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
    <div className="mt-12 towns-tenant">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-primary">
          DUNA Document Archive
        </h3>
      </div>

      <Card className="border border-line shadow-sm bg-modalBackgroundDark [&_button]:!bg-white [&_button]:!text-black [&_button]:!border-gray-300 [&_button]:hover:!bg-gray-50">
        <CardContent className="p-6">
          <DocumentsSection
            initialDocuments={documents}
            hideHeader={true}
            hideComms={true}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TownsDunaAdministrationArchive;
