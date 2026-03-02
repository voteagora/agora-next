import React from "react";
import Link from "next/link";
import DocumentsSection from "./DocumentsSection";
import FinancialStatementsClient from "./FinancialStatementsClient";
import {
  getForumTopics,
  getDunaCategoryId,
  getForumCategoryAttachments,
} from "@/lib/actions/forum";

import Tenant from "@/lib/tenant/tenant";
import {
  UIDunaDescriptionConfig,
  UIFinancialStatementsConfig,
} from "@/lib/tenant/tenantUI";
import { ExternalLink } from "@/icons/ExternalLink";
import FormationDocumentsList from "./FormationDocumentsList";
import GovernanceInfoSections from "@/app/info/components/GovernanceInfoSections";
import { cn } from "@/lib/utils";

const DunaAdministration = async () => {
  let documents: any[] = [];
  let topicsResult: any = null;

  try {
    const dunaCategoryId = await getDunaCategoryId();
    if (!dunaCategoryId) {
      console.error("Could not find DUNA category ID");
      return (
        <div className="mt-8">
          <div className="text-center py-8 text-red-500">
            Error: Could not find DUNA category
          </div>
        </div>
      );
    }
    const [topics, documentsResult, archivedDocumentsResult] =
      await Promise.all([
        getForumTopics({ categoryId: dunaCategoryId }),
        getForumCategoryAttachments({ categoryId: dunaCategoryId }),
        getForumCategoryAttachments({
          categoryId: dunaCategoryId,
          archived: true,
        }),
      ]);

    topicsResult = topics;
    if (documentsResult.success) {
      documents = documentsResult.data;
    }
    // Include archived documents for formation documents section
    if (archivedDocumentsResult.success) {
      // Merge archived documents, avoiding duplicates by id
      const archivedDocs = archivedDocumentsResult.data.filter(
        (archivedDoc: any) =>
          !documents.some((doc: any) => doc.id === archivedDoc.id)
      );
      documents = [...documents, ...archivedDocs];
    }
  } catch (error) {
    console.error("Error fetching forum data:", error);
  }

  const { ui } = Tenant.current();
  const dunaToggle = ui.toggle("duna");
  const administrationTitle =
    (dunaToggle?.config as { title?: string })?.title ?? "DUNA Administration";
  const financialStatementsToggle = ui.toggle("duna/financial-statements");
  const isFinancialStatementsEnabled =
    financialStatementsToggle?.enabled ?? false;
  const financialStatementsConfig =
    financialStatementsToggle?.config as UIFinancialStatementsConfig;
  const dunaDescriptionToggle = ui.toggle("duna-description");
  const dunaDescriptionContent = (
    dunaDescriptionToggle?.config as UIDunaDescriptionConfig
  )?.content;
  const infoAboutPage = ui.page("info/about");
  const infoPage = ui.page("info");
  const communityLinks = infoPage?.links ?? [];

  const financialStatements = isFinancialStatementsEnabled
    ? topicsResult?.success
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

  const aboutContent =
    dunaDescriptionToggle?.enabled && dunaDescriptionContent
      ? dunaDescriptionContent
      : (infoAboutPage?.description ?? null);
  const hasAboutContent = !!aboutContent;
  const hasFinancialOrFormation =
    (isFinancialStatementsEnabled && financialStatements.length > 0) ||
    otherDocuments.length > 0;

  return (
    <div id="duna-administration" className="mt-8 flex flex-col gap-6">
      {/* Row 1: About + Community Resources */}
      {(hasAboutContent || communityLinks.length > 0) && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* About DUNI */}
          {hasAboutContent && (
            <div className="flex-1 border border-line rounded-2xl p-6 bg-wash shadow-sm">
              <p className="text-base font-semibold text-tertiary uppercase tracking-wide mb-6">
                {ui.customization?.customAboutSubtitle || administrationTitle}
              </p>
              <div className="text-secondary text-base leading-relaxed whitespace-pre-line">
                {aboutContent}
              </div>
            </div>
          )}

          {/* Community Resources */}
          {communityLinks.length > 0 && (
            <div className="lg:w-80 border border-line rounded-2xl p-6 bg-wash shadow-sm flex-shrink-0">
              <p className="text-base font-semibold text-tertiary uppercase tracking-wide mb-6">
                COMMUNITY RESOURCES
              </p>
              <div className="flex flex-col gap-1">
                {communityLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 py-2 text-secondary hover:text-primary transition-colors group"
                  >
                    <ExternalLink className="flex-shrink-0 text-tertiary group-hover:text-primary transition-colors" />
                    <span className="text-base font-medium">
                      {link.title} <span className="text-tertiary">↗</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Row 2: Financial Statements + Formation Documents */}
      {hasFinancialOrFormation && (
        <div
          className={cn(
            "flex-col lg:flex-row gap-6",
            otherDocuments.length === 0 ? "flex-1" : "flex"
          )}
        >
          {/* Financial Statements */}
          {isFinancialStatementsEnabled && financialStatements.length > 0 && (
            <div className="border border-line rounded-2xl p-6 bg-wash cardBackground shadow-sm min-w-0">
              <p className="text-base font-semibold text-tertiary uppercase tracking-wide">
                {financialStatementsConfig?.title?.toUpperCase() ??
                  "FINANCIAL STATEMENTS"}
              </p>
              <FinancialStatementsClient
                statements={financialStatements}
                title=""
              />
            </div>
          )}

          {/* Formation Documents */}
          {otherDocuments.length > 0 && (
            <div
              className={`border border-line rounded-2xl p-6 bg-wash shadow-sm min-w-0 flex-1`}
            >
              <p className="text-base font-semibold text-tertiary uppercase tracking-wide">
                FORMATION DOCUMENTS
              </p>
              <FormationDocumentsList initialDocuments={otherDocuments} />
            </div>
          )}
        </div>
      )}
      <GovernanceInfoSections />
    </div>
  );
};

export default DunaAdministration;
