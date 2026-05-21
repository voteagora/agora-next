/*
 * TanStack Start port of src/app/document-archive/page.tsx.
 * URL: /document-archive
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { InfoHero } from "@/components/Governance/InfoHero";
import DunaDisclosuresContent from "@/components/Duna/DunaDisclosuresContent";
import { Card, CardContent } from "@/components/ui/card";
import DocumentsSection from "@/components/Duna/DocumentsSection";

export const Route = createFileRoute("/document-archive")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("info")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  head: () => {
    const tenant = Tenant.current();
    const page = tenant.ui.page("info") || tenant.ui.page("/");
    const { title, description } = page!.meta;
    return {
      meta: [{ title }, { name: "description", content: description }],
    };
  },
  loader: async () => {
    const { ui } = Tenant.current();
    const hasDunaAdministration = ui.toggle("duna")?.enabled === true;
    const hasDunaDisclosures = ui.toggle("duna-disclosures")?.enabled === true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let financialDocuments: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let otherDocuments: any[] = [];

    if (hasDunaAdministration) {
      try {
        const { getDunaCategoryId, getForumCategoryAttachments } = await import(
          "@/server/forum/actions"
        );
        const dunaCategoryId = await getDunaCategoryId();
        if (dunaCategoryId) {
          const documentsResult = await getForumCategoryAttachments({
            categoryId: dunaCategoryId,
            archived: true,
          });
          if (documentsResult.success) {
            financialDocuments = documentsResult.data.filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (doc: any) => doc.isFinancialStatement
            );
            otherDocuments = documentsResult.data.filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (doc: any) => !doc.isFinancialStatement
            );
          }
        }
      } catch (error) {
        console.error("Error fetching forum data:", error);
      }
    }

    return {
      hasDunaAdministration,
      hasDunaDisclosures,
      financialDocuments,
      otherDocuments,
    };
  },
  component: function DocumentArchivePage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    if (!data) return null;
    const {
      hasDunaAdministration,
      hasDunaDisclosures,
      financialDocuments,
      otherDocuments,
    } = data;

    return (
      <div className="flex flex-col">
        <InfoHero />
        {hasDunaAdministration && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-primary">
                DUNA Document Archive
              </h3>
            </div>
            {otherDocuments.length > 0 && (
              <>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-primary">
                    Formation Documents
                  </h4>
                </div>
                <Card className="border border-line bg-cardBackground shadow-sm">
                  <CardContent className="p-6">
                    <DocumentsSection
                      initialDocuments={otherDocuments}
                      hideHeader={true}
                    />
                  </CardContent>
                </Card>
              </>
            )}
            {financialDocuments.length > 0 && (
              <>
                <div className="my-4">
                  <h4 className="text-lg font-semibold text-primary">
                    Financial Statements
                  </h4>
                </div>
                <Card className="border border-line bg-cardBackground shadow-sm">
                  <CardContent className="p-6">
                    <DocumentsSection
                      initialDocuments={financialDocuments}
                      hideHeader={true}
                      hideComms={true}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
        {hasDunaAdministration && hasDunaDisclosures && (
          <DunaDisclosuresContent />
        )}
      </div>
    );
  },
});
