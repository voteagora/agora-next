import { z } from "zod";
import {
  DraftProposal,
  DraftVotingModuleType,
  ApprovalProposalType,
} from "@/app/proposals/draft/types";
import { DraftProposalSchema } from "@/app/proposals/draft/schemas/DraftProposalSchema";

type FormData = z.output<typeof DraftProposalSchema>;

export function formDataToProposal(data: FormData): DraftProposal {
  const proposalType = data.proposalConfigType?.toString() ?? "0";

  switch (data.type) {
    case DraftVotingModuleType.BASIC:
      return {
        id: 0,
        author_address: "" as `0x${string}`,
        title: data.title,
        abstract: data.abstract,
        voting_module_type: DraftVotingModuleType.BASIC,
        proposal_type: proposalType,
        transactions: (data.transactions ?? []).map((t) => ({
          id: 0,
          order: 0,
          target: t.target,
          value: t.value,
          calldata: t.calldata,
          signature: t.signature ?? null,
          description: t.description,
          proposal_id: 0,
        })),
        checklist_items: [],
        proposal_scope: data.proposal_scope,
        tiers: data.tiers ?? [],
      } as unknown as DraftProposal;

    case DraftVotingModuleType.APPROVAL: {
      const ap = data.approvalProposal;
      return {
        id: 0,
        author_address: "" as `0x${string}`,
        title: data.title,
        abstract: data.abstract,
        voting_module_type: DraftVotingModuleType.APPROVAL,
        proposal_type: proposalType,
        budget: parseInt(ap?.budget ?? "0") || 0,
        criteria: (ap?.criteria ??
          ApprovalProposalType.THRESHOLD) as ApprovalProposalType,
        max_options: parseInt(ap?.maxOptions ?? "1") || 1,
        threshold: parseInt(ap?.threshold ?? "0") || 0,
        top_choices: parseInt(ap?.topChoices ?? "1") || 1,
        approval_options: (ap?.options ?? []).map((opt) => ({
          title: opt.title,
          transactions: opt.transactions.map((t, i) => ({
            id: 0,
            order: i,
            target: t.target,
            value: t.value,
            calldata: t.calldata,
            signature: t.signature ?? null,
            description: t.description,
            proposal_id: 0,
          })),
        })),
        transactions: [],
        checklist_items: [],
        proposal_scope: data.proposal_scope,
        tiers: data.tiers ?? [],
      } as unknown as DraftProposal;
    }

    case DraftVotingModuleType.OPTIMISTIC:
      return {
        id: 0,
        author_address: "" as `0x${string}`,
        title: data.title,
        abstract: data.abstract,
        voting_module_type: DraftVotingModuleType.OPTIMISTIC,
        proposal_type: proposalType,
        transactions: [],
        checklist_items: [],
        proposal_scope: data.proposal_scope,
        tiers: data.tiers ?? [],
      } as unknown as DraftProposal;

    case DraftVotingModuleType.SOCIAL:
      return {
        id: 0,
        author_address: "" as `0x${string}`,
        title: data.title,
        abstract: data.abstract,
        voting_module_type: DraftVotingModuleType.SOCIAL,
        proposal_type: proposalType,
        proposal_social_type: data.socialProposal?.type ?? "basic",
        start_date_social: data.socialProposal?.start_date ?? new Date(),
        end_date_social: data.socialProposal?.end_date ?? new Date(),
        social_options: data.socialProposal?.options ?? [],
        transactions: [],
        checklist_items: [],
        proposal_scope: data.proposal_scope,
        tiers: data.tiers ?? [],
      } as unknown as DraftProposal;

    default:
      throw new Error(
        `Unsupported proposal type: ${(data as { type: string }).type}`
      );
  }
}
