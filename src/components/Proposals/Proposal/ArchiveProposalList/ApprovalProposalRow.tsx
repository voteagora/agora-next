"use client";

import { useMemo } from "react";
import {
  ArchiveListProposal,
  FixedProposalType,
} from "@/lib/types/archiveProposal";
import Tenant from "@/lib/tenant/tenant";
import { ApprovalStatusView } from "../OPApprovalProposalStatus";
import { BaseRowLayout } from "./BaseRowLayout";
import { ArchiveRowProps } from "./types";
import { extractDisplayData } from "./utils";

/**
 * Extract approval voting data from proposal kwargs
 */
function extractApprovalData(proposal: ArchiveListProposal): {
  choices: string[];
  maxApprovals: number;
} {
  const kwargs = proposal.kwargs || {};

  // Extract choices from kwargs
  const choices = (kwargs.choices as string[]) || [];

  // Extract max_approvals from kwargs
  const maxApprovals =
    typeof kwargs.max_approvals === "number" ? kwargs.max_approvals : 1;

  return {
    choices,
    maxApprovals,
  };
}

/**
 * Row component for APPROVAL proposals from archive
 */
export function ApprovalProposalRow({
  proposal,
  tokenDecimals,
  proposalType = "APPROVAL",
}: ArchiveRowProps) {
  const { token } = Tenant.current();
  const decimals = tokenDecimals ?? token.decimals ?? 18;

  // Compute display data and approval metrics
  const { displayData, approvalData, proposalTypeName } = useMemo(() => {
    const displayData = extractDisplayData(proposal, proposalType, decimals);
    const approvalData = extractApprovalData(proposal);
    const proposalTypeName =
      (proposal.proposal_type as FixedProposalType)?.name ?? proposalType;
    return { displayData, approvalData, proposalTypeName };
  }, [proposal, decimals, proposalType]);

  // Render approval status view showing "Select X of Y Options"
  const metricsContent = (
    <ApprovalStatusView
      maxOptions={approvalData.maxApprovals}
      optionCount={approvalData.choices.length}
    />
  );

  return (
    <BaseRowLayout
      data={displayData}
      metricsContent={metricsContent}
      proposalTypeName={proposalTypeName}
    />
  );
}

export default ApprovalProposalRow;
