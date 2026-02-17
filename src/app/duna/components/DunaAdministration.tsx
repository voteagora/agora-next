import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import DocumentsSection from "./DocumentsSection";
import FinancialStatementsClient from "./FinancialStatementsClient";
import {
  getForumTopics,
  getDunaCategoryId,
  getForumCategoryAttachments,
} from "@/lib/actions/forum";
import { transformForumTopics, ForumTopic } from "@/lib/forumUtils";
import Tenant from "@/lib/tenant/tenant";
import {
  UIDunaDescriptionConfig,
  UIFinancialStatementsConfig,
} from "@/lib/tenant/tenantUI";

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
  let topicsResult: any = null;

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
    const [topics, documentsResult] = await Promise.all([
      getForumTopics({ categoryId: dunaCategoryId }),
      getForumCategoryAttachments({ categoryId: dunaCategoryId }),
    ]);

    topicsResult = topics;
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

  const { ui } = Tenant.current();
  const financialStatementsToggle = ui.toggle("duna/financial-statements");
  const isFinancialStatementsEnabled =
    financialStatementsToggle?.enabled ?? false;
  const financialStatementsConfig =
    financialStatementsToggle?.config as UIFinancialStatementsConfig;

  const financialStatements = isFinancialStatementsEnabled
    ? topicsResult.success
      ? topicsResult.data
          .filter((topic: any) => topic.isFinancialStatement === true)
          .map((topic: any) => ({
            id: topic.id,
            name: topic.title,
            url: "",
            ipfsCid: "",
            createdAt: topic.createdAt,
            uploadedBy: topic.address,
            archived: topic.deletedAt !== null,
            revealTime: topic.revealTime,
            expirationTime: topic.expirationTime,
            topicId: topic.id,
            topicTitle: topic.title,
          }))
      : []
    : [];
  const otherDocuments = isFinancialStatementsEnabled
    ? documents.filter((doc) => !(doc.isFinancialStatement ?? false))
    : documents;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-primary">
          DUNA Administration
        </h3>
      </div>
      <DunaDescription />

      {isFinancialStatementsEnabled && financialStatements.length > 0 && (
        <div className="mb-6">
          <FinancialStatementsClient
            statements={financialStatements}
            title={financialStatementsConfig?.title ?? "Financial Statements"}
          />
        </div>
      )}

      {otherDocuments.length > 0 && (
        <Card className="border border-line bg-cardBackground shadow-sm">
          <CardContent className="p-6">
            <div className="">
              <DocumentsSection initialDocuments={otherDocuments} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DunaAdministration;
