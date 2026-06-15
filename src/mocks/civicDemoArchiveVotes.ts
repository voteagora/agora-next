import type { ArchiveNonVoterRow, ArchiveVoteRow } from "@/lib/archiveUtils";
import { getCivicDemoArchiveProposal } from "@/mocks/civicDemoArchiveProposals";
import { isCivicDemoEnabled } from "@/mocks/civicDemoProposals";
import type { EasOodaoVoteOutcome } from "@/lib/types/archiveProposal";
import marioAvatar from "@/assets/tenant/mario_stephan.jpeg";

const SARAH = "0x0000000000000000000000000000000000000001";
const JAMES = "0x0000000000000000000000000000000000000002";
const MARIA = "0x0000000000000000000000000000000000000003";
const ANONYMOUS = "0x0000000000000000000000000000000000000004";
const AISHA = "0x0000000000000000000000000000000000000005";
const MICHAEL = "0x0000000000000000000000000000000000000006";
const ELENA = "0x0000000000000000000000000000000000000007";
const MARIO = "0x0000000000000000000000000000000000000008";

type SupportCode = "0" | "1" | "2";

type VoteSpec = {
  voter: string;
  name: string;
  support: SupportCode;
  weight: number;
  daysAgo: number;
  image?: string;
  params?: number[];
};

type NonVoterSpec = {
  addr: string;
  name: string;
  vp: number;
};

function daysAgoTs(days: number) {
  return Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
}

function toVoteRow(spec: VoteSpec, index: number): ArchiveVoteRow {
  return {
    voter: spec.voter,
    name: spec.name,
    support: spec.support,
    weight: String(spec.weight),
    block_number: 100000 + index,
    ts: daysAgoTs(spec.daysAgo),
    transaction_hash: `0xcivicvote${spec.voter.slice(-4)}${index}`,
    image: spec.image ?? null,
    citizen_type: null,
    params: spec.params ?? null,
  };
}

function toNonVoterRow(spec: NonVoterSpec): ArchiveNonVoterRow {
  return {
    addr: spec.addr,
    name: spec.name,
    vp: String(spec.vp),
    citizen_type: null,
  };
}

const PROPOSAL_VOTES: Record<string, VoteSpec[]> = {
  "civic-demo-7": [
    {
      voter: MARIO,
      name: "Mario Stephan",
      support: "1",
      weight: 18,
      daysAgo: 2,
      image: marioAvatar.src,
    },
    {
      voter: JAMES,
      name: "Dr. James Okafor",
      support: "1",
      weight: 8,
      daysAgo: 2,
    },
    {
      voter: SARAH,
      name: "Sarah M.",
      support: "1",
      weight: 6,
      daysAgo: 3,
    },
    {
      voter: MARIA,
      name: "Maria Gonzalez",
      support: "1",
      weight: 5,
      daysAgo: 3,
    },
    {
      voter: AISHA,
      name: "Aisha Rahman",
      support: "1",
      weight: 4,
      daysAgo: 4,
    },
    {
      voter: MICHAEL,
      name: "Michael Chen",
      support: "1",
      weight: 3,
      daysAgo: 4,
    },
    {
      voter: ELENA,
      name: "Elena Volkov",
      support: "1",
      weight: 2,
      daysAgo: 4,
    },
    {
      voter: "0x0000000000000000000000000000000000000009",
      name: "Field Programs Delegate",
      support: "1",
      weight: 2,
      daysAgo: 4,
    },
    {
      voter: ANONYMOUS,
      name: "Anonymous Donor",
      support: "0",
      weight: 4,
      daysAgo: 3,
    },
    {
      voter: "0x000000000000000000000000000000000000000a",
      name: "Sahel Program Lead",
      support: "0",
      weight: 2,
      daysAgo: 3,
    },
    {
      voter: "0x000000000000000000000000000000000000000b",
      name: "Ukraine Response Coordinator",
      support: "2",
      weight: 4,
      daysAgo: 3,
    },
    {
      voter: "0x000000000000000000000000000000000000000c",
      name: "Yemen Advocacy Lead",
      support: "2",
      weight: 4,
      daysAgo: 3,
    },
    {
      voter: "0x000000000000000000000000000000000000000d",
      name: "Board Observer",
      support: "2",
      weight: 4,
      daysAgo: 2,
    },
  ],
  "civic-demo-example-a": [
    {
      voter: MARIO,
      name: "Mario Stephan",
      support: "1",
      weight: 12,
      daysAgo: 1,
      params: [0],
      image: marioAvatar.src,
    },
    {
      voter: SARAH,
      name: "Sarah M.",
      support: "1",
      weight: 9,
      daysAgo: 1,
      params: [0],
    },
    {
      voter: JAMES,
      name: "Dr. James Okafor",
      support: "1",
      weight: 7,
      daysAgo: 2,
      params: [0],
    },
    {
      voter: AISHA,
      name: "Aisha Rahman",
      support: "1",
      weight: 6,
      daysAgo: 2,
      params: [1],
    },
    {
      voter: MARIA,
      name: "Maria Gonzalez",
      support: "1",
      weight: 5,
      daysAgo: 2,
      params: [1],
    },
    {
      voter: MICHAEL,
      name: "Michael Chen",
      support: "1",
      weight: 4,
      daysAgo: 2,
      params: [2],
    },
    {
      voter: ELENA,
      name: "Elena Volkov",
      support: "1",
      weight: 3,
      daysAgo: 2,
      params: [3],
    },
    {
      voter: ANONYMOUS,
      name: "Anonymous Donor",
      support: "1",
      weight: 2,
      daysAgo: 2,
      params: [3],
    },
  ],
  "civic-demo-example-b": [
    {
      voter: ELENA,
      name: "Elena Volkov",
      support: "1",
      weight: 10,
      daysAgo: 1,
      params: [2],
    },
    {
      voter: MARIA,
      name: "Maria Gonzalez",
      support: "1",
      weight: 8,
      daysAgo: 1,
      params: [2],
    },
    {
      voter: AISHA,
      name: "Aisha Rahman",
      support: "1",
      weight: 7,
      daysAgo: 1,
      params: [2],
    },
    {
      voter: MICHAEL,
      name: "Michael Chen",
      support: "1",
      weight: 6,
      daysAgo: 2,
      params: [1],
    },
    {
      voter: JAMES,
      name: "Dr. James Okafor",
      support: "1",
      weight: 5,
      daysAgo: 2,
      params: [1],
    },
    {
      voter: SARAH,
      name: "Sarah M.",
      support: "1",
      weight: 4,
      daysAgo: 2,
      params: [0],
    },
    {
      voter: MARIO,
      name: "Mario Stephan",
      support: "1",
      weight: 3,
      daysAgo: 2,
      params: [3],
      image: marioAvatar.src,
    },
    {
      voter: ANONYMOUS,
      name: "Anonymous Donor",
      support: "1",
      weight: 2,
      daysAgo: 2,
      params: [0],
    },
  ],
  "civic-demo-gov-1": [
    {
      voter: MARIO,
      name: "Mario Stephan",
      support: "1",
      weight: 8,
      daysAgo: 0,
      image: marioAvatar.src,
    },
    {
      voter: JAMES,
      name: "Dr. James Okafor",
      support: "1",
      weight: 6,
      daysAgo: 0,
    },
    {
      voter: SARAH,
      name: "Sarah M.",
      support: "1",
      weight: 4,
      daysAgo: 0,
    },
    {
      voter: MARIA,
      name: "Maria Gonzalez",
      support: "1",
      weight: 2,
      daysAgo: 0,
    },
    {
      voter: AISHA,
      name: "Aisha Rahman",
      support: "1",
      weight: 2,
      daysAgo: 0,
    },
    {
      voter: ELENA,
      name: "Elena Volkov",
      support: "0",
      weight: 2,
      daysAgo: 0,
    },
    {
      voter: MICHAEL,
      name: "Michael Chen",
      support: "0",
      weight: 1,
      daysAgo: 0,
    },
    {
      voter: ANONYMOUS,
      name: "Anonymous Donor",
      support: "2",
      weight: 4,
      daysAgo: 0,
    },
    {
      voter: "0x0000000000000000000000000000000000000009",
      name: "Field Programs Delegate",
      support: "2",
      weight: 4,
      daysAgo: 0,
    },
  ],
  "civic-demo-2": [
    {
      voter: MARIO,
      name: "Mario Stephan",
      support: "1",
      weight: 12,
      daysAgo: 4,
      image: marioAvatar.src,
    },
    {
      voter: SARAH,
      name: "Sarah M.",
      support: "1",
      weight: 10,
      daysAgo: 4,
    },
    {
      voter: MARIA,
      name: "Maria Gonzalez",
      support: "1",
      weight: 8,
      daysAgo: 4,
    },
    {
      voter: JAMES,
      name: "Dr. James Okafor",
      support: "1",
      weight: 6,
      daysAgo: 4,
    },
    {
      voter: AISHA,
      name: "Aisha Rahman",
      support: "1",
      weight: 4,
      daysAgo: 3,
    },
    {
      voter: MICHAEL,
      name: "Michael Chen",
      support: "0",
      weight: 4,
      daysAgo: 3,
    },
    {
      voter: ELENA,
      name: "Elena Volkov",
      support: "2",
      weight: 6,
      daysAgo: 3,
    },
    {
      voter: ANONYMOUS,
      name: "Anonymous Donor",
      support: "2",
      weight: 5,
      daysAgo: 3,
    },
  ],
};

const PROPOSAL_NON_VOTERS: Record<string, NonVoterSpec[]> = {
  "civic-demo-7": [
    {
      addr: "0x00000000000000000000000000000000000000e1",
      name: "Geneva Field Office",
      vp: 38,
    },
    {
      addr: "0x00000000000000000000000000000000000000e2",
      name: "Partner Org Delegate",
      vp: 42,
    },
    {
      addr: "0x00000000000000000000000000000000000000e3",
      name: "Emeritus Council Member",
      vp: 32,
    },
  ],
  "civic-demo-example-a": [
    {
      addr: "0x00000000000000000000000000000000000000e4",
      name: "Major Donor Circle (undecided)",
      vp: 42,
    },
    {
      addr: "0x00000000000000000000000000000000000000e5",
      name: "Web3 Philanthropy Partner",
      vp: 35,
    },
    {
      addr: "0x00000000000000000000000000000000000000e6",
      name: "Annual Fund Steward",
      vp: 22,
    },
  ],
  "civic-demo-example-b": [
    {
      addr: "0x00000000000000000000000000000000000000e7",
      name: "Creative Partners Guild",
      vp: 38,
    },
    {
      addr: "0x00000000000000000000000000000000000000e8",
      name: "Board Arts Liaison",
      vp: 31,
    },
    {
      addr: "0x00000000000000000000000000000000000000e9",
      name: "Crypto-native Donor Pool",
      vp: 27,
    },
  ],
  "civic-demo-gov-1": [
    {
      addr: "0x00000000000000000000000000000000000000e1",
      name: "Geneva Field Office",
      vp: 38,
    },
    {
      addr: "0x00000000000000000000000000000000000000e2",
      name: "Partner Org Delegate",
      vp: 42,
    },
    {
      addr: "0x00000000000000000000000000000000000000e3",
      name: "Emeritus Council Member",
      vp: 32,
    },
    {
      addr: "0x00000000000000000000000000000000000000e4",
      name: "Washington Advocacy Team",
      vp: 28,
    },
    {
      addr: "0x00000000000000000000000000000000000000e5",
      name: "Sahel Program Lead",
      vp: 5,
    },
  ],
};

function buildDefaultVotes(proposalId: string): VoteSpec[] {
  const proposal = getCivicDemoArchiveProposal(proposalId);
  if (!proposal?.outcome) {
    return [];
  }

  const thOutcome = (proposal.outcome as EasOodaoVoteOutcome)?.[
    "token-holders"
  ];
  const forVotes = Number(thOutcome?.["1"] ?? 0);
  const againstVotes = Number(thOutcome?.["0"] ?? 0);
  const abstainVotes = Number(thOutcome?.["2"] ?? 0);

  const members: Array<{
    voter: string;
    name: string;
    image?: string;
  }> = [
    { voter: MARIO, name: "Mario Stephan", image: marioAvatar.src },
    { voter: JAMES, name: "Dr. James Okafor" },
    { voter: SARAH, name: "Sarah M." },
    { voter: MARIA, name: "Maria Gonzalez" },
    { voter: AISHA, name: "Aisha Rahman" },
    { voter: MICHAEL, name: "Michael Chen" },
    { voter: ELENA, name: "Elena Volkov" },
    { voter: ANONYMOUS, name: "Anonymous Donor" },
  ];

  const specs: VoteSpec[] = [];
  let memberIndex = 0;

  const addVotes = (total: number, support: SupportCode) => {
    let remaining = total;
    while (remaining > 0 && memberIndex < members.length) {
      const member = members[memberIndex++];
      const weight = Math.min(remaining, Math.max(1, Math.ceil(total / 4)));
      specs.push({
        ...member,
        support,
        weight,
        daysAgo: 2,
      });
      remaining -= weight;
    }
  };

  addVotes(forVotes, "1");
  addVotes(againstVotes, "0");
  addVotes(abstainVotes, "2");

  return specs;
}

function buildDefaultNonVoters(proposalId: string): NonVoterSpec[] {
  const proposal = getCivicDemoArchiveProposal(proposalId);
  if (!proposal) {
    return [];
  }

  const thOutcome = (proposal.outcome as EasOodaoVoteOutcome)?.[
    "token-holders"
  ];
  const voted =
    Number(thOutcome?.["1"] ?? 0) +
    Number(thOutcome?.["0"] ?? 0) +
    Number(thOutcome?.["2"] ?? 0);
  const totalVp = Number(proposal.total_voting_power_at_start ?? 178);
  const nonVotedVp = Math.max(totalVp - voted, 0);

  if (nonVotedVp <= 0) {
    return [];
  }

  const shares = [0.4, 0.35, 0.25];
  const names = [
    "Geneva Field Office",
    "Partner Org Delegate",
    "Emeritus Council Member",
  ];

  return names.map((name, index) => ({
    addr: `0x00000000000000000000000000000000000000f${index + 1}`,
    name,
    vp: Math.max(1, Math.round(nonVotedVp * shares[index])),
  }));
}

export function getCivicDemoArchiveVotes(proposalId: string): ArchiveVoteRow[] {
  if (!isCivicDemoEnabled()) {
    return [];
  }

  const specs = PROPOSAL_VOTES[proposalId] ?? buildDefaultVotes(proposalId);
  return specs.map(toVoteRow);
}

export function getCivicDemoArchiveNonVoters(
  proposalId: string
): ArchiveNonVoterRow[] {
  if (!isCivicDemoEnabled()) {
    return [];
  }

  const specs =
    PROPOSAL_NON_VOTERS[proposalId] ?? buildDefaultNonVoters(proposalId);
  return specs.map(toNonVoterRow);
}
