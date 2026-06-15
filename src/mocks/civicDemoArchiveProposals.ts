import { ArchiveListProposal } from "@/lib/types/archiveProposal";
import { isCivicDemoEnabled } from "@/mocks/civicDemoProposals";
import {
  MEDIATION_GOV_DESCRIPTION,
  MEDIATION_GOV_TITLE,
  MEDIATION_TEMP_CHECK_DESCRIPTION,
  MEDIATION_TEMP_CHECK_TITLE,
} from "@/mocks/civicDemoMediationFlow";
import {
  ARTIST_CHOICES,
  ARTIST_VOTE_DESCRIPTION,
  ARTIST_VOTE_TITLE,
  buildApprovalArchiveFields,
  INITIATIVE_CHOICES,
  INITIATIVE_VOTE_DESCRIPTION,
  INITIATIVE_VOTE_TITLE,
  multiChoiceOutcome,
} from "@/mocks/civicDemoSupporterParticipation";

const SARAH = "0x0000000000000000000000000000000000000001";
const JAMES = "0x0000000000000000000000000000000000000002";
const MARIA = "0x0000000000000000000000000000000000000003";
const AISHA = "0x0000000000000000000000000000000000000005";
const MICHAEL = "0x0000000000000000000000000000000000000006";
const ELENA = "0x0000000000000000000000000000000000000007";
const MARIO = "0x0000000000000000000000000000000000000008";
const TOTAL_VP = "178";

function daysAgoTimestamp(days: number) {
  return Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
}

function daysFromNowTimestamp(days: number) {
  return Math.floor((Date.now() + days * 24 * 60 * 60 * 1000) / 1000);
}

function voteOutcome(forVotes: number, against: number, abstain: number) {
  return {
    "token-holders": {
      "1": String(forVotes),
      "0": String(against),
      "2": String(abstain),
    },
    "no-param": {
      "1": String(forVotes),
      "0": String(against),
      "2": String(abstain),
    },
  };
}

function baseOodaoProposal(
  id: string,
  title: string,
  proposer: string,
  overrides: Partial<ArchiveListProposal> = {}
): ArchiveListProposal {
  const start = daysAgoTimestamp(3);
  const end = daysFromNowTimestamp(10);

  return {
    id,
    title,
    proposer,
    proposer_ens: null,
    start_blocktime: start,
    end_blocktime: end,
    start_block: 0,
    end_block: 0,
    lifecycle_stage: "ACTIVE",
    data_eng_properties: { source: "eas-oodao", liveness: "live" },
    outcome: voteOutcome(0, 0, 0),
    proposal_type: {
      class: "STANDARD",
      quorum: 2000,
      approval_threshold: 5100,
      eas_uid: "",
      name: "Standard",
      description: "",
    },
    voting_module: "standard",
    voting_module_name: "standard",
    total_voting_power_at_start: TOTAL_VP,
    quorum: "36",
    tags: ["gov-proposal"],
    proposal_type_approval: "APPROVED",
    num_of_votes: 0,
    ...overrides,
  } as ArchiveListProposal;
}

export function getCivicDemoArchiveProposals(): ArchiveListProposal[] {
  return [
    baseOodaoProposal(
      "civic-demo-1",
      "Q3 2026 Civilian Protection Fund Allocation: Ukraine and Yemen Priority",
      SARAH,
      {
        start_blocktime: daysAgoTimestamp(2),
        end_blocktime: daysFromNowTimestamp(12),
        lifecycle_stage: "ACTIVE",
        outcome: voteOutcome(38, 4, 19),
        num_of_votes: 61,
        data_eng_properties: { source: "snapshot", liveness: "live" },
        type: "single-choice",
        state: "active",
        author: SARAH,
        choices: [
          "Prioritize Ukraine",
          "Prioritize Yemen",
          "Balanced regional allocation",
        ],
        scores: [28, 19, 14],
        scores_total: 61,
        start: daysAgoTimestamp(2),
        end: daysFromNowTimestamp(12),
        link: "#",
      }
    ),
    baseOodaoProposal(
      "civic-demo-2",
      "Community Reporting Framework for Urban Warfare Documentation",
      MARIA,
      {
        start_blocktime: daysAgoTimestamp(4),
        end_blocktime: daysFromNowTimestamp(8),
        outcome: voteOutcome(42, 6, 11),
        num_of_votes: 59,
      }
    ),
    baseOodaoProposal(
      "civic-demo-3",
      'Partner Artist Collaboration: "Voices from Conflict Zones" Exhibition',
      ELENA,
      {
        start_blocktime: daysAgoTimestamp(1),
        end_blocktime: daysFromNowTimestamp(14),
        outcome: voteOutcome(35, 2, 8),
        num_of_votes: 45,
        proposal_type: {
          class: "APPROVAL",
          quorum: 2000,
          approval_threshold: 5100,
          eas_uid: "",
          name: "Approval",
          description: "",
        },
        voting_module: "approval",
        voting_module_name: "approval",
        kwargs: {
          choices: [
            "Host exhibition in Washington, DC",
            "Traveling exhibition across partner cities",
            "Digital-only gallery with field team stories",
          ],
          max_approvals: 1,
          criteria: 0,
          criteria_value: "0",
        },
        choices: [
          "Host exhibition in Washington, DC",
          "Traveling exhibition across partner cities",
          "Digital-only gallery with field team stories",
        ],
        max_approvals: 1,
      }
    ),
    baseOodaoProposal(
      "civic-demo-4",
      "Emergency Response Fund: Rapid Deployment Authorization",
      MICHAEL,
      {
        start_blocktime: daysAgoTimestamp(30),
        end_blocktime: daysAgoTimestamp(16),
        lifecycle_stage: "SUCCEEDED",
        outcome: voteOutcome(45, 3, 12),
        num_of_votes: 60,
      }
    ),
    baseOodaoProposal(
      "civic-demo-5",
      "Annual Impact Report 2025: Publication and Distribution Approach",
      JAMES,
      {
        start_blocktime: daysAgoTimestamp(45),
        end_blocktime: daysAgoTimestamp(31),
        lifecycle_stage: "SUCCEEDED",
        outcome: voteOutcome(52, 2, 9),
        num_of_votes: 63,
      }
    ),
    baseOodaoProposal(
      "civic-demo-6",
      "Matching Fund Campaign: Sahel Civilian Protection Initiative",
      ELENA,
      {
        start_blocktime: daysAgoTimestamp(60),
        end_blocktime: daysAgoTimestamp(46),
        lifecycle_stage: "SUCCEEDED",
        outcome: voteOutcome(48, 5, 10),
        num_of_votes: 63,
        data_eng_properties: { source: "snapshot", liveness: "live" },
        type: "copeland",
        state: "closed",
        author: ELENA,
        choices: [
          "Community protection training",
          "Documentation and reporting tools",
          "Emergency relocation support",
        ],
        scores: [31, 24, 18],
        scores_total: 58,
        start: daysAgoTimestamp(60),
        end: daysAgoTimestamp(46),
        link: "#",
      }
    ),
    baseOodaoProposal("civic-demo-7", MEDIATION_TEMP_CHECK_TITLE, JAMES, {
      description: MEDIATION_TEMP_CHECK_DESCRIPTION,
      start_blocktime: daysAgoTimestamp(5),
      end_blocktime: daysAgoTimestamp(1),
      lifecycle_stage: "SUCCEEDED",
      outcome: voteOutcome(48, 6, 12),
      num_of_votes: 66,
      tags: ["tempcheck"],
      proposal_type_approval: "APPROVED",
    }),
    baseOodaoProposal("civic-demo-example-a", INITIATIVE_VOTE_TITLE, MARIO, {
      description: INITIATIVE_VOTE_DESCRIPTION,
      start_blocktime: daysAgoTimestamp(0),
      end_blocktime: daysFromNowTimestamp(10),
      lifecycle_stage: "ACTIVE",
      outcome: multiChoiceOutcome([31, 22, 14, 12]),
      num_of_votes: 79,
      tags: ["gov-proposal"],
      proposal_type_approval: "APPROVED",
      ...buildApprovalArchiveFields(INITIATIVE_CHOICES),
    }),
    baseOodaoProposal("civic-demo-example-b", ARTIST_VOTE_TITLE, ELENA, {
      description: ARTIST_VOTE_DESCRIPTION,
      start_blocktime: daysAgoTimestamp(0),
      end_blocktime: daysFromNowTimestamp(12),
      lifecycle_stage: "ACTIVE",
      outcome: multiChoiceOutcome([18, 24, 28, 12]),
      num_of_votes: 82,
      tags: ["gov-proposal"],
      proposal_type_approval: "APPROVED",
      ...buildApprovalArchiveFields(ARTIST_CHOICES),
    }),
    baseOodaoProposal(
      "civic-demo-8",
      "Community interest in quarterly town halls with field teams",
      AISHA,
      {
        start_blocktime: daysAgoTimestamp(1),
        end_blocktime: daysFromNowTimestamp(4),
        outcome: voteOutcome(33, 4, 18),
        num_of_votes: 55,
        tags: ["tempcheck"],
        proposal_type_approval: "APPROVED",
      }
    ),
    baseOodaoProposal(
      "civic-demo-9",
      "Should CIVIC adopt updated urban warfare documentation standards?",
      MARIA,
      {
        start_blocktime: daysAgoTimestamp(20),
        end_blocktime: daysAgoTimestamp(6),
        lifecycle_stage: "SUCCEEDED",
        outcome: voteOutcome(41, 5, 9),
        num_of_votes: 55,
        tags: ["tempcheck"],
        proposal_type_approval: "APPROVED",
      }
    ),
    baseOodaoProposal("civic-demo-gov-1", MEDIATION_GOV_TITLE, JAMES, {
      description: MEDIATION_GOV_DESCRIPTION,
      start_blocktime: daysAgoTimestamp(0),
      end_blocktime: daysFromNowTimestamp(10),
      lifecycle_stage: "ACTIVE",
      outcome: voteOutcome(22, 3, 8),
      num_of_votes: 33,
      tags: ["gov-proposal"],
      proposal_type_approval: "APPROVED",
    }),
    baseOodaoProposal(
      "civic-demo-gov-2",
      "Authorize Quarterly Virtual Town Halls with Field Teams",
      AISHA,
      {
        start_blocktime: daysAgoTimestamp(0),
        end_blocktime: daysFromNowTimestamp(12),
        lifecycle_stage: "ACTIVE",
        outcome: voteOutcome(22, 1, 4),
        num_of_votes: 27,
        tags: ["gov-proposal"],
        proposal_type_approval: "APPROVED",
      }
    ),
  ];
}

export function getCivicDemoArchiveProposal(
  proposalId: string
): ArchiveListProposal | null {
  return (
    getCivicDemoArchiveProposals().find(
      (proposal) => proposal.id === proposalId
    ) ?? null
  );
}

export function getCivicDemoArchiveProposalsResult(filter: string) {
  let data = getCivicDemoArchiveProposals();

  if (filter === "relevant") {
    data = data.filter(
      (proposal) =>
        !proposal.cancel_event &&
        !proposal.delete_event &&
        proposal.lifecycle_stage !== "CANCELLED"
    );
  } else if (filter === "temp-checks") {
    data = data.filter((proposal) => proposal.tags?.includes("tempcheck"));
  }

  return {
    meta: {
      has_next: false,
      total_returned: data.length,
      next_offset: data.length,
    },
    data,
  };
}

export { isCivicDemoEnabled };
