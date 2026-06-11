import React from "react";
import FinancialStatementsClient from "./FinancialStatementsClient";
import { getForumTopics, getDunaCategoryId } from "@/lib/actions/forum";
import Tenant from "@/lib/tenant/tenant";
import { UIFinancialStatementsConfig } from "@/lib/tenant/tenantUI";
import DunaMetricsCards from "./DunaMetricsCards";
import {
  getCivicDemoFinancialStatements,
  isCivicDemoEnabled,
} from "@/mocks/civicDemoFinancials";

const DunaFinancials = async () => {
  const { ui } = Tenant.current();
  const financialStatementsToggle = ui.toggle("duna/financial-statements");
  const isFinancialStatementsEnabled =
    financialStatementsToggle?.enabled ?? false;
  const financialStatementsConfig =
    financialStatementsToggle?.config as UIFinancialStatementsConfig;

  let financialStatements: Array<{
    id: number;
    name: string;
    url: string;
    ipfsCid: string;
    createdAt: string;
    uploadedBy: string;
    archived?: boolean;
    revealTime?: string | null;
    expirationTime?: string | null;
    topicId?: number;
    topicTitle?: string;
  }> = [];

  if (isCivicDemoEnabled()) {
    financialStatements = getCivicDemoFinancialStatements();
  } else if (isFinancialStatementsEnabled) {
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

      topicsResult = await getForumTopics({ categoryId: dunaCategoryId });
    } catch (error) {
      console.error("Error fetching forum data:", error);
    }

    financialStatements = topicsResult?.success
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
      : [];
  }

  return (
    <div id="duna-financials" className="mt-8 flex flex-col gap-6">
      <DunaMetricsCards />

      {isFinancialStatementsEnabled && financialStatements.length > 0 && (
        <div className="border border-line rounded-2xl p-6 bg-cardBackground shadow-sm min-w-0">
          <p className="text-base font-semibold text-primary uppercase tracking-wide">
            {financialStatementsConfig?.title?.toUpperCase() ??
              "FINANCIAL STATEMENTS"}
          </p>
          <FinancialStatementsClient
            statements={financialStatements}
            title=""
          />
        </div>
      )}
    </div>
  );
};

export default DunaFinancials;
