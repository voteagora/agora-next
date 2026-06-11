import { Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalData } from "@/lib/proposalUtils";

const PROPOSER = "0x0000000000000000000000000000000000000001";
const CVP_DECIMALS = 0;

function voteResults(forVotes: number, against: number, abstain: number) {
  return {
    for: BigInt(forVotes),
    against: BigInt(against),
    abstain: BigInt(abstain),
    decimals: CVP_DECIMALS,
  };
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function baseProposal(id: string, overrides: Partial<Proposal>): Proposal {
  const now = new Date();
  return {
    id,
    proposer: PROPOSER,
    snapshotBlockNumber: 0,
    createdTime: now,
    startTime: daysAgo(3),
    startBlock: 1n,
    endTime: daysFromNow(10),
    endBlock: 1n,
    cancelledTime: null,
    executedTime: null,
    executedBlock: null,
    queuedTime: null,
    description: null,
    quorum: null,
    approvalThreshold: null,
    proposalTypeData: null,
    createdTransactionHash: null,
    cancelledTransactionHash: null,
    queuedTransactionHash: null,
    executedTransactionHash: null,
    unformattedProposalData: null,
    proposalData: { options: [] },
    proposalResults: voteResults(0, 0, 0),
    proposalType: "STANDARD",
    status: "ACTIVE",
    markdowntitle: "",
    proposalData: { options: [] },
    ...overrides,
  };
}

export function getCivicDemoProposals(): Proposal[] {
  return [
    baseProposal("civic-demo-1", {
      markdowntitle:
        "Q3 2026 Civilian Protection Fund Allocation: Ukraine and Yemen Priority",
      proposalType: "SNAPSHOT",
      status: "ACTIVE",
      startTime: daysAgo(2),
      endTime: daysFromNow(12),
      proposalData: {
        title:
          "Q3 2026 Civilian Protection Fund Allocation: Ukraine and Yemen Priority",
        start_ts: Math.floor(daysAgo(2).getTime() / 1000),
        end_ts: Math.floor(daysFromNow(12).getTime() / 1000),
        created_ts: Math.floor(daysAgo(2).getTime() / 1000),
        link: "#",
        scores: ["28", "19", "14"],
        type: "single-choice",
        votes: "61",
        state: "active",
        body: "",
        choices: [
          "Prioritize Ukraine",
          "Prioritize Yemen",
          "Balanced regional allocation",
        ],
      } as ParsedProposalData["SNAPSHOT"]["kind"],
      proposalResults: voteResults(38, 4, 19),
    }),
    baseProposal("civic-demo-2", {
      markdowntitle:
        "Community Reporting Framework for Urban Warfare Documentation",
      proposalType: "STANDARD",
      status: "ACTIVE",
      startTime: daysAgo(4),
      endTime: daysFromNow(8),
      proposalResults: voteResults(42, 6, 11),
    }),
    baseProposal("civic-demo-3", {
      markdowntitle:
        'Partner Artist Collaboration: "Voices from Conflict Zones" Exhibition',
      proposalType: "APPROVAL",
      status: "ACTIVE",
      startTime: daysAgo(1),
      endTime: daysFromNow(14),
      proposalResults: voteResults(35, 2, 8),
      proposalData: {
        options: [
          {
            targets: [],
            values: [],
            calldatas: [],
            description: "Host exhibition in Washington, DC",
            functionArgsName: [],
            budgetTokensSpent: null,
          },
          {
            targets: [],
            values: [],
            calldatas: [],
            description: "Traveling exhibition across partner cities",
            functionArgsName: [],
            budgetTokensSpent: null,
          },
          {
            targets: [],
            values: [],
            calldatas: [],
            description: "Digital-only gallery with field team stories",
            functionArgsName: [],
            budgetTokensSpent: null,
          },
        ],
        proposalSettings: {
          maxApprovals: 1,
          criteria: "THRESHOLD",
          budgetToken: "0x0000000000000000000000000000000000000000",
          criteriaValue: 0n,
          budgetAmount: 0n,
        },
      } as ParsedProposalData["APPROVAL"]["kind"],
    }),
    baseProposal("civic-demo-4", {
      markdowntitle:
        "Emergency Response Fund: Rapid Deployment Authorization",
      proposalType: "STANDARD",
      status: "SUCCEEDED",
      startTime: daysAgo(30),
      endTime: daysAgo(16),
      proposalResults: voteResults(45, 3, 12),
    }),
    baseProposal("civic-demo-5", {
      markdowntitle:
        "Annual Impact Report 2025: Publication and Distribution Approach",
      proposalType: "STANDARD",
      status: "SUCCEEDED",
      startTime: daysAgo(45),
      endTime: daysAgo(31),
      proposalResults: voteResults(52, 2, 9),
    }),
    baseProposal("civic-demo-6", {
      markdowntitle:
        "Matching Fund Campaign: Sahel Civilian Protection Initiative",
      proposalType: "SNAPSHOT",
      status: "SUCCEEDED",
      startTime: daysAgo(60),
      endTime: daysAgo(46),
      proposalData: {
        title: "Matching Fund Campaign: Sahel Civilian Protection Initiative",
        start_ts: Math.floor(daysAgo(60).getTime() / 1000),
        end_ts: Math.floor(daysAgo(46).getTime() / 1000),
        created_ts: Math.floor(daysAgo(60).getTime() / 1000),
        link: "#",
        scores: ["31", "24", "18"],
        type: "copeland",
        votes: "58",
        state: "closed",
        body: "",
        choices: [
          "Community protection training",
          "Documentation and reporting tools",
          "Emergency relocation support",
        ],
      } as ParsedProposalData["SNAPSHOT"]["kind"],
      proposalResults: voteResults(48, 5, 10),
    }),
    baseProposal("civic-demo-7", {
      markdowntitle:
        "Temp Check: Should CIVIC explore local mediation support programs?",
      proposalType: "STANDARD",
      status: "ACTIVE",
      startTime: daysAgo(1),
      endTime: daysFromNow(4),
      proposalResults: voteResults(29, 8, 15),
    }),
    baseProposal("civic-demo-8", {
      markdowntitle:
        "Temp Check: Community interest in quarterly town halls with field teams",
      proposalType: "STANDARD",
      status: "ACTIVE",
      startTime: daysAgo(1),
      endTime: daysFromNow(4),
      proposalResults: voteResults(33, 4, 18),
    }),
  ];
}

export function isCivicDemoEnabled() {
  return process.env.NEXT_PUBLIC_CIVIC_DEMO === "true";
}

export function getCivicDemoMetrics() {
  return {
    totalSupply: "200",
    votableSupply: "178",
  };
}
