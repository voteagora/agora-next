import React from "react";
import Link from "next/link";
import {
  getDunaCategoryId,
  getForumCategoryAttachments,
} from "@/lib/actions/forum";
import Tenant from "@/lib/tenant/tenant";
import { UIDunaDescriptionConfig } from "@/lib/tenant/tenantUI";
import { ExternalLink } from "@/icons/ExternalLink";
import FormationDocumentsList from "./FormationDocumentsList";
import GovernanceInfoSections from "@/app/info/components/GovernanceInfoSections";

const DunaAbout = async () => {
  let documents: any[] = [];

  try {
    const dunaCategoryId = await getDunaCategoryId();
    if (dunaCategoryId) {
      const [documentsResult, archivedDocumentsResult] = await Promise.all([
        getForumCategoryAttachments({ categoryId: dunaCategoryId }),
        getForumCategoryAttachments({
          categoryId: dunaCategoryId,
          archived: true,
        }),
      ]);

      if (documentsResult.success) {
        documents = documentsResult.data;
      }
      if (archivedDocumentsResult.success) {
        const archivedDocs = archivedDocumentsResult.data.filter(
          (archivedDoc: any) =>
            !documents.some((doc: any) => doc.id === archivedDoc.id)
        );
        documents = [...documents, ...archivedDocs];
      }
    }
  } catch (error) {
    console.error("Error fetching forum data:", error);
  }

  const { ui } = Tenant.current();
  const dunaToggle = ui.toggle("duna");
  const administrationTitle =
    (dunaToggle?.config as { title?: string })?.title ?? "DUNA Administration";
  const dunaDescriptionToggle = ui.toggle("duna-description");
  const dunaDescriptionContent = (
    dunaDescriptionToggle?.config as UIDunaDescriptionConfig
  )?.content;
  const infoAboutPage = ui.page("info/about");
  const infoPage = ui.page("info");
  const communityLinks = infoPage?.links ?? [];

  const documentOrder = [
    "Association Agreement",
    "Purpose",
    "Existing Authorization of Authority",
    "Grant Programs Overview",
    "Redacted EIN",
  ];

  const getDocumentOrderIndex = (docName: string) => {
    const index = documentOrder.findIndex((suffix) => docName.includes(suffix));
    return index === -1 ? documentOrder.length : index;
  };

  const otherDocuments = documents
    .filter((doc) => !doc.isFinancialStatement)
    .sort((a, b) => {
      const indexA = getDocumentOrderIndex(a.name);
      const indexB = getDocumentOrderIndex(b.name);
      return indexA - indexB;
    });

  const aboutContent =
    dunaDescriptionToggle?.enabled && dunaDescriptionContent
      ? dunaDescriptionContent
      : (infoAboutPage?.description ?? null);
  const hasAboutContent = !!aboutContent;
  const aboutTitle =
    ui.customization?.customAboutSubtitle || administrationTitle;
  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* About + Community Resources */}
      {(hasAboutContent || communityLinks.length > 0) && (
        <div className="flex flex-col lg:flex-row gap-6">
          {hasAboutContent && (
            <div className="flex-1 border border-line rounded-2xl p-6 bg-cardBackground shadow-sm">
              <p className="text-base font-semibold text-primary uppercase tracking-wide mb-6">
                {aboutTitle}
              </p>
              <div className="text-secondary text-base leading-relaxed whitespace-pre-line">
                {aboutContent}
              </div>
            </div>
          )}

          {communityLinks.length > 0 && (
            <div className="lg:w-80 border border-line rounded-2xl p-6 bg-cardBackground shadow-sm flex-shrink-0">
              <p className="text-base font-semibold text-primary uppercase tracking-wide mb-6">
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
                    <ExternalLink className="flex-shrink-0 text-secondary group-hover:text-primary transition-colors" />
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

      {/* Formation Documents */}
      {otherDocuments.length > 0 && (
        <div className="border border-line rounded-2xl p-6 bg-cardBackground shadow-sm min-w-0 flex-1">
          <p className="text-base font-semibold text-primary uppercase tracking-wide">
            FORMATION DOCUMENTS
          </p>
          <FormationDocumentsList initialDocuments={otherDocuments} />
        </div>
      )}

      <GovernanceInfoSections />
    </div>
  );
};

export default DunaAbout;
