import { describe, expect, test } from "vitest";
import {
  extractAuthoringApprovalData,
  filterAuthoringProposalTypesByEntryType,
  filterAuthoringProposalTypesByVotingType,
  formatAuthoringProposalTypeLabel,
  getApprovalSettingsFromAuthoringData,
  getAuthoringProposalMetadata,
  getAuthoringVotingTypeMetadata,
  normalizeAuthoringProposalTypeConfig,
  normalizeAuthoringVotingType,
  toAuthoringProposalTypeSelectOption,
} from "@/features/proposals/authoring/shared";

describe("authoring shared utilities", () => {
  test("normalizes voting types across create and draft variants", () => {
    expect(normalizeAuthoringVotingType("STANDARD")).toBe("standard");
    expect(normalizeAuthoringVotingType("basic")).toBe("standard");
    expect(normalizeAuthoringVotingType("APPROVAL")).toBe("approval");
    expect(normalizeAuthoringVotingType("optimistic")).toBe("optimistic");
    expect(normalizeAuthoringVotingType(undefined)).toBeNull();
  });

  test("filters proposal types by entry type", () => {
    const proposalTypes = [
      { id: "1", module: "tempcheck" },
      { id: "2", module: "gov-proposal" },
      { id: "3", module: "GOV-PROPOSAL" },
    ];

    expect(
      filterAuthoringProposalTypesByEntryType(proposalTypes, "gov-proposal")
    ).toEqual([
      { id: "2", module: "gov-proposal" },
      { id: "3", module: "GOV-PROPOSAL" },
    ]);
  });

  test("filters proposal types by voting type without misclassifying null modules", () => {
    const proposalTypes = [
      { name: "Treasury Transfer", module: undefined },
      { name: "Approval Voting", module: undefined },
      { name: "Optimistic Governance", module: undefined },
    ];

    expect(
      filterAuthoringProposalTypesByVotingType(proposalTypes, "basic")
    ).toEqual([{ name: "Treasury Transfer", module: undefined }]);
    expect(
      filterAuthoringProposalTypesByVotingType(proposalTypes, "approval")
    ).toEqual([{ name: "Approval Voting", module: undefined }]);
    expect(
      filterAuthoringProposalTypesByVotingType(proposalTypes, "optimistic")
    ).toEqual([{ name: "Optimistic Governance", module: undefined }]);
  });

  test("normalizes proposal type config percentages for authoring UIs", () => {
    expect(
      normalizeAuthoringProposalTypeConfig({
        id: 7,
        name: "Treasury",
        description: null,
        quorum: 1250,
        approvalThreshold: 6000,
        module: "STANDARD",
      })
    ).toEqual({
      id: "7",
      name: "Treasury",
      description: "",
      quorum: 12.5,
      approvalThreshold: 60,
      module: "STANDARD",
      scopes: [],
    });
  });

  test("extracts approval temp-check data and converts it to form settings", () => {
    const approvalData = extractAuthoringApprovalData({
      kwargs: {
        choices: ["A", "B"],
        max_approvals: 2,
        criteria: 1,
        criteria_value: 3,
        budget: 100,
      },
    });

    expect(approvalData).toEqual({
      choices: ["A", "B"],
      maxApprovals: 2,
      criteria: 1,
      criteriaValue: 3,
      budget: 100,
    });

    expect(getApprovalSettingsFromAuthoringData(approvalData)).toEqual({
      budget: 100,
      maxApprovals: 2,
      criteria: "top-choices",
      criteriaValue: 3,
      choices: [
        { id: "choice-0", title: "A" },
        { id: "choice-1", title: "B" },
      ],
    });
  });

  test("formats proposal type labels consistently across lifecycle forms", () => {
    expect(
      formatAuthoringProposalTypeLabel({
        name: "Treasury",
        quorum: 1250,
        approval_threshold: 6000,
      })
    ).toBe("Treasury (12.5% Quorum, 60% Approval)");

    expect(
      toAuthoringProposalTypeSelectOption({
        proposal_type_id: 7,
        name: "Treasury",
        quorum: 1250,
        approval_threshold: 6000,
      })
    ).toEqual({
      label: "Treasury (12.5% Quorum, 60% Approval)",
      value: "7",
    });
  });

  test("returns shared metadata for voting modules and proposal variants", () => {
    expect(
      getAuthoringVotingTypeMetadata("standard", {
        namespace: "optimism",
        titleVariant: "proposal",
        includeAbstain: false,
      })
    ).toEqual({
      title: "Basic Proposal",
      description:
        "Voters are asked to vote for, against, or abstain. The proposal passes if the for votes exceed quorum AND if the for votes, relative to the total votes, exceed the approval threshold. \u26a0\ufe0f This option is currently not supported by the governor contract. \u26a0\ufe0f",
    });

    expect(
      getAuthoringProposalMetadata("approval", {
        namespace: "ens",
      })
    ).toEqual({
      title: "Approval Proposal",
      description:
        "Voters select from multiple options. Options are approved based on the criteria (threshold or top choices).",
    });

    expect(
      getAuthoringProposalMetadata("social", {
        namespace: "ens",
      })
    ).toEqual({
      title: "Social Proposal",
      description: "A proposal that resolves via a snapshot vote.",
    });
  });
});
