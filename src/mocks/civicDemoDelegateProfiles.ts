import { Delegate, DelegateChunk } from "@/app/api/common/delegates/delegate";
import { Delegation } from "@/app/api/common/delegations/delegation";
import { Vote } from "@/app/api/common/votes/vote";
import { PaginatedResult } from "@/app/lib/pagination";
import { isCivicDemoEnabled } from "@/mocks/civicDemoProposals";
import marioAvatar from "@/assets/tenant/mario_stephan.jpeg";

type CivicMemberProfile = {
  address: string;
  displayName: string;
  cardStatement: string;
  fullStatement: string;
  participation: number;
  avatar?: string;
  location?: string;
  votingPower?: string;
  numOfDelegators?: number;
  proposalsCreated?: number;
  votedFor?: number;
  votedAgainst?: number;
  votedAbstain?: number;
  topIssues?: { type: string; value: string }[];
  votes?: Array<{
    proposalId: string;
    title: string;
    support: "FOR" | "AGAINST" | "ABSTAIN";
    daysAgo: number;
  }>;
};

const MARIO_ADDRESS = "0x0000000000000000000000000000000000000008";

const CIVIC_MEMBER_PROFILES: CivicMemberProfile[] = [
  {
    address: "0x0000000000000000000000000000000000000001",
    displayName: "Sarah M.",
    cardStatement: "Committed to civilian protection in conflict zones",
    fullStatement:
      "I support governance decisions that prioritize civilian protection in active conflict zones, especially Ukraine and Yemen. Transparent community voting helps ensure field programs reflect the needs of affected communities.",
    participation: 0.82,
    votes: [
      {
        proposalId: "civic-demo-2",
        title: "Community Reporting Framework for Urban Warfare Documentation",
        support: "FOR",
        daysAgo: 5,
      },
      {
        proposalId: "civic-demo-4",
        title: "Emergency Response Fund: Rapid Deployment Authorization",
        support: "FOR",
        daysAgo: 18,
      },
    ],
  },
  {
    address: "0x0000000000000000000000000000000000000002",
    displayName: "Dr. James Okafor",
    cardStatement: "Supporting accountability in peacekeeping operations",
    fullStatement:
      "Peacekeeping operations must be accountable to the communities they serve. I vote to strengthen CIVIC's advocacy for clearer reporting standards and independent review of civilian harm incidents.",
    participation: 0.76,
    proposalsCreated: 2,
    votes: [
      {
        proposalId: "civic-demo-5",
        title:
          "Annual Impact Report 2025: Publication and Distribution Approach",
        support: "FOR",
        daysAgo: 22,
      },
      {
        proposalId: "civic-demo-gov-1",
        title: "Establish Local Mediation Support Pilot Program",
        support: "FOR",
        daysAgo: 1,
      },
    ],
  },
  {
    address: "0x0000000000000000000000000000000000000003",
    displayName: "Maria Gonzalez",
    cardStatement: "Humanitarian aid transparency matters",
    fullStatement:
      "Humanitarian organizations earn trust through transparency. I participate in CIVIC governance to ensure funding decisions, impact reporting, and field priorities are visible to members and donors alike.",
    participation: 0.71,
    proposalsCreated: 2,
    votes: [
      {
        proposalId: "civic-demo-5",
        title:
          "Annual Impact Report 2025: Publication and Distribution Approach",
        support: "FOR",
        daysAgo: 22,
      },
      {
        proposalId: "civic-demo-2",
        title: "Community Reporting Framework for Urban Warfare Documentation",
        support: "FOR",
        daysAgo: 4,
      },
    ],
  },
  {
    address: "0x0000000000000000000000000000000000000004",
    displayName: "Anonymous Donor",
    cardStatement: "Standing with communities affected by conflict",
    fullStatement:
      "I prefer to remain anonymous, but I am committed to supporting civilians caught in conflict. I use my vote to back programs that center community protection and rapid response capacity.",
    participation: 0.65,
    votes: [
      {
        proposalId: "civic-demo-4",
        title: "Emergency Response Fund: Rapid Deployment Authorization",
        support: "FOR",
        daysAgo: 20,
      },
    ],
  },
  {
    address: "0x0000000000000000000000000000000000000005",
    displayName: "Aisha Rahman",
    cardStatement: "Advocating for amends and reparations",
    fullStatement:
      "Amends and reparations for civilian harm are essential to rebuilding trust after conflict. I support proposals that expand CIVIC's work on accountability and survivor-centered advocacy.",
    participation: 0.88,
    proposalsCreated: 2,
    votes: [
      {
        proposalId: "civic-demo-1",
        title:
          "Q3 2026 Civilian Protection Fund Allocation: Ukraine and Yemen Priority",
        support: "FOR",
        daysAgo: 3,
      },
      {
        proposalId: "civic-demo-6",
        title: "Matching Fund Campaign: Sahel Civilian Protection Initiative",
        support: "FOR",
        daysAgo: 30,
      },
    ],
  },
  {
    address: "0x0000000000000000000000000000000000000006",
    displayName: "Michael Chen",
    cardStatement: "Governance can strengthen humanitarian impact",
    fullStatement:
      "Effective governance connects donors, field teams, and affected communities. I believe member voting helps CIVIC align strategic priorities with on-the-ground protection needs.",
    participation: 0.74,
    votes: [
      {
        proposalId: "civic-demo-8",
        title:
          "Temp Check: Community interest in quarterly town halls with field teams",
        support: "FOR",
        daysAgo: 1,
      },
    ],
  },
  {
    address: "0x0000000000000000000000000000000000000007",
    displayName: "Elena Volkov",
    cardStatement: "Every civilian voice counts",
    fullStatement:
      "Protection policy should reflect the voices of civilians, not just institutions. I participate to elevate community perspectives in CIVIC's Ukraine and urban warfare programs.",
    participation: 0.79,
    votes: [
      {
        proposalId: "civic-demo-1",
        title:
          "Q3 2026 Civilian Protection Fund Allocation: Ukraine and Yemen Priority",
        support: "ABSTAIN",
        daysAgo: 3,
      },
    ],
  },
  {
    address: MARIO_ADDRESS,
    displayName: "Mario Stephan",
    cardStatement:
      "Building philanthropic partnerships for civilian protection",
    fullStatement: `Mario Stephan is CIVIC's Director of Philanthropic Partnerships, based in Geneva. He brings over 20 years of experience in the aid and relief sector, with expertise in Islamic and blockchain philanthropy.

He leads CIVIC's efforts to expand and diversify funding for civilian protection — including partnerships across traditional philanthropy and Web3-enabled giving. Mario believes transparent community governance strengthens donor accountability and helps ensure field programs reflect the priorities of communities affected by conflict.

Previously, he served as Head of Philanthropy Diversification and Impact at Médecins Sans Frontières (MSF), where he developed MSF's Web3 strategy and launched Stake2Care, a liquid staking program directing crypto rewards to humanitarian work.`,
    participation: 0.91,
    avatar: marioAvatar.src,
    location: "Geneva, Switzerland",
    votingPower: "1",
    numOfDelegators: 0,
    proposalsCreated: 0,
    votedFor: 5,
    votedAgainst: 1,
    votedAbstain: 1,
    topIssues: [
      {
        type: "treasury",
        value:
          "Ensure civilian protection funds are allocated transparently across Ukraine, Yemen, and Sahel programs",
      },
      {
        type: "funding",
        value:
          "Expand philanthropic partnerships to diversify funding for field operations and rapid response",
      },
      {
        type: "publicGoods",
        value:
          "Support research and advocacy that advances protection of civilians in conflict zones",
      },
    ],
    votes: [
      {
        proposalId: "civic-demo-1",
        title:
          "Q3 2026 Civilian Protection Fund Allocation: Ukraine and Yemen Priority",
        support: "FOR",
        daysAgo: 3,
      },
      {
        proposalId: "civic-demo-2",
        title: "Community Reporting Framework for Urban Warfare Documentation",
        support: "FOR",
        daysAgo: 5,
      },
      {
        proposalId: "civic-demo-3",
        title:
          'Partner Artist Collaboration: "Voices from Conflict Zones" Exhibition',
        support: "AGAINST",
        daysAgo: 2,
      },
      {
        proposalId: "civic-demo-4",
        title: "Emergency Response Fund: Rapid Deployment Authorization",
        support: "FOR",
        daysAgo: 18,
      },
      {
        proposalId: "civic-demo-5",
        title:
          "Annual Impact Report 2025: Publication and Distribution Approach",
        support: "FOR",
        daysAgo: 22,
      },
      {
        proposalId: "civic-demo-6",
        title: "Matching Fund Campaign: Sahel Civilian Protection Initiative",
        support: "ABSTAIN",
        daysAgo: 30,
      },
    ],
  },
];

type CivicDelegationRecord = {
  from: string;
  to: string;
  allowance: string;
  daysAgo: number;
};

// Pilot delegation history between civic demo members
const CIVIC_DELEGATIONS: CivicDelegationRecord[] = [
  {
    from: "0x0000000000000000000000000000000000000001",
    to: MARIO_ADDRESS,
    allowance: "1",
    daysAgo: 45,
  },
  {
    from: "0x0000000000000000000000000000000000000002",
    to: MARIO_ADDRESS,
    allowance: "1",
    daysAgo: 28,
  },
  {
    from: "0x0000000000000000000000000000000000000005",
    to: MARIO_ADDRESS,
    allowance: "1",
    daysAgo: 14,
  },
  {
    from: "0x0000000000000000000000000000000000000006",
    to: MARIO_ADDRESS,
    allowance: "1",
    daysAgo: 7,
  },
  {
    from: "0x0000000000000000000000000000000000000007",
    to: MARIO_ADDRESS,
    allowance: "1",
    daysAgo: 21,
  },
  {
    from: MARIO_ADDRESS,
    to: "0x0000000000000000000000000000000000000002",
    allowance: "1",
    daysAgo: 120,
  },
  {
    from: "0x0000000000000000000000000000000000000004",
    to: "0x0000000000000000000000000000000000000003",
    allowance: "1",
    daysAgo: 60,
  },
  {
    from: "0x0000000000000000000000000000000000000003",
    to: "0x0000000000000000000000000000000000000002",
    allowance: "1",
    daysAgo: 40,
  },
  {
    from: "0x0000000000000000000000000000000000000001",
    to: "0x0000000000000000000000000000000000000005",
    allowance: "1",
    daysAgo: 55,
  },
  {
    from: "0x0000000000000000000000000000000000000006",
    to: "0x0000000000000000000000000000000000000007",
    allowance: "1",
    daysAgo: 18,
  },
];

const now = new Date();

function findProfile(address: string): CivicMemberProfile | undefined {
  return CIVIC_MEMBER_PROFILES.find(
    (p) => p.address.toLowerCase() === address.toLowerCase()
  );
}

function getInboundDelegations(address: string): CivicDelegationRecord[] {
  return CIVIC_DELEGATIONS.filter(
    (d) => d.to.toLowerCase() === address.toLowerCase()
  );
}

function getOutboundDelegations(address: string): CivicDelegationRecord[] {
  return CIVIC_DELEGATIONS.filter(
    (d) => d.from.toLowerCase() === address.toLowerCase()
  );
}

function makeDelegationRecord(record: CivicDelegationRecord): Delegation {
  return {
    from: record.from,
    to: record.to,
    allowance: record.allowance,
    percentage: "100",
    timestamp: new Date(Date.now() - record.daysAgo * 24 * 60 * 60 * 1000),
    type: "DIRECT",
    amount: "FULL",
    transaction_hash: `0xcivicdel${record.from.slice(-4)}${record.to.slice(-4)}`,
  };
}

function getComputedVotingPower(profile: CivicMemberProfile): string {
  const inbound = getInboundDelegations(profile.address);
  const basePower = Number(profile.votingPower ?? "1");
  const delegatedPower = inbound.reduce(
    (sum, d) => sum + Number(d.allowance),
    0
  );
  return String(basePower + delegatedPower);
}

function makeStatement(profile: CivicMemberProfile) {
  return {
    created_at: now,
    discord: null,
    endorsed: false,
    payload: {
      delegateStatement: profile.fullStatement,
      ...(profile.topIssues ? { topIssues: profile.topIssues } : {}),
    },
    signature: "civic-demo",
    twitter: null,
    updated_at: now,
    warpcast: null,
    scw_address: null,
  };
}

function buildVote(
  profile: CivicMemberProfile,
  vote: NonNullable<CivicMemberProfile["votes"]>[number]
): Vote {
  const timestamp = new Date(Date.now() - vote.daysAgo * 24 * 60 * 60 * 1000);
  return {
    transactionHash: `0xcivic${vote.proposalId}`,
    address: profile.address,
    proposalId: vote.proposalId,
    support: vote.support,
    weight: profile.votingPower ?? "1",
    reason: null,
    params: [],
    proposalValue: 0n,
    proposalTitle: vote.title,
    proposalType:
      vote.proposalId.includes("7") || vote.proposalId.includes("8")
        ? "STANDARD"
        : "STANDARD",
    timestamp,
    blockNumber: BigInt(vote.daysAgo * 1000),
    citizenType: null,
    voterMetadata: null,
  };
}

export function getCivicDemoDelegateProfile(address: string): Delegate | null {
  if (!isCivicDemoEnabled()) {
    return null;
  }

  const profile = findProfile(address);
  if (!profile) {
    return null;
  }

  const votingPower = getComputedVotingPower(profile);
  const inboundDelegations = getInboundDelegations(profile.address);
  const votedFor =
    profile.votedFor ??
    profile.votes?.filter((v) => v.support === "FOR").length ??
    0;
  const votedAgainst =
    profile.votedAgainst ??
    profile.votes?.filter((v) => v.support === "AGAINST").length ??
    0;
  const votedAbstain =
    profile.votedAbstain ??
    profile.votes?.filter((v) => v.support === "ABSTAIN").length ??
    0;

  return {
    address: profile.address,
    votingPower: {
      total: votingPower,
      direct: votingPower,
      advanced: "0",
    },
    votingPowerRelativeToVotableSupply: 0,
    votingPowerRelativeToQuorum: 0,
    proposalsCreated: BigInt(profile.proposalsCreated ?? 0),
    proposalsVotedOn: BigInt(profile.votes?.length ?? 0),
    votedFor: String(votedFor),
    votedAgainst: String(votedAgainst),
    votedAbstain: String(votedAbstain),
    votingParticipation: profile.participation,
    lastTenProps: String(Math.min(profile.votes?.length ?? 0, 10)),
    totalProposals: 8,
    numOfDelegators: BigInt(
      profile.numOfDelegators ?? inboundDelegations.length
    ),
    statement: makeStatement(profile),
    relativeVotingPowerToVotableSupply: "0",
    vpChange7d: 0n,
    participation: profile.participation,
  };
}

export function getCivicDemoDelegateChunk(
  profile: CivicMemberProfile
): DelegateChunk {
  const votingPower = getComputedVotingPower(profile);
  return {
    address: profile.address,
    votingPower: {
      total: votingPower,
      direct: profile.votingPower ?? "1",
      advanced: "0",
    },
    participation: profile.participation,
    statement: {
      ...makeStatement(profile),
      payload: { delegateStatement: profile.cardStatement },
    },
  };
}

export function getCivicDemoDelegates(): DelegateChunk[] {
  return CIVIC_MEMBER_PROFILES.map(getCivicDemoDelegateChunk);
}

export function getCivicDemoDisplayName(address: string): string | undefined {
  if (!isCivicDemoEnabled()) {
    return undefined;
  }
  return findProfile(address)?.displayName;
}

export function getCivicDemoAvatar(address: string): string | undefined {
  if (!isCivicDemoEnabled()) {
    return undefined;
  }
  return findProfile(address)?.avatar;
}

export function getCivicDemoLocation(address: string): string | undefined {
  if (!isCivicDemoEnabled()) {
    return undefined;
  }
  return findProfile(address)?.location;
}

export function getCivicDemoDelegateVotes(
  address: string
): PaginatedResult<Vote[]> {
  const profile = findProfile(address);
  const votes = profile?.votes?.map((v) => buildVote(profile, v)) ?? [];

  return {
    meta: {
      has_next: false,
      total_returned: votes.length,
      next_offset: votes.length,
    },
    data: votes,
  };
}

export function getCivicDemoDelegators(
  address: string
): PaginatedResult<Delegation[]> {
  const data = getInboundDelegations(address).map(makeDelegationRecord);

  return {
    meta: {
      has_next: false,
      total_returned: data.length,
      next_offset: data.length,
    },
    data,
  };
}

export function getCivicDemoDelegatees(address: string): Delegation[] {
  return getOutboundDelegations(address).map(makeDelegationRecord);
}

export function isCivicDemoDelegateAddress(address: string): boolean {
  return isCivicDemoEnabled() && Boolean(findProfile(address));
}
