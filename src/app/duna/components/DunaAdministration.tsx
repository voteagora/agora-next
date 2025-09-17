import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import DocumentsSection from "./DocumentsSection";
import {
  getForumTopics,
  getDunaCategoryId,
  getForumAttachments,
} from "@/lib/actions/forum";
import { transformForumTopics, ForumTopic } from "@/lib/forumUtils";
import Tenant from "@/lib/tenant/tenant";
import { UIDunaDescriptionConfig } from "@/lib/tenant/tenantUI";

const DunaDescription = () => {
  const { ui } = Tenant.current();
  const toggle = ui.toggle("duna-description");
  const content = (toggle?.config as UIDunaDescriptionConfig)?.content;

  if (!toggle?.enabled || !content) return null;
  return <p className="text-sm text-primary mb-6">{content}</p>;
};

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
    const [topicsResult, documentsResult] = await Promise.all([
      getForumTopics(dunaCategoryId),
      getForumAttachments({ categoryId: dunaCategoryId }),
    ]);

    if (topicsResult.success) {
      dunaReports = transformForumTopics(topicsResult.data, {
        mergePostAttachments: true,
      });
    }
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
          DUNA Administration
        </h3>
      </div>
      <DunaDescription />

      <Card className="border border-line bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="">
            <DocumentsSection initialDocuments={documents} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DunaAdministration;
