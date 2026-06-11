import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { isCivicDemoEnabled } from "@/mocks/civicDemoProposals";

type CivicMember = {
  address: string;
  displayName: string;
  statement: string;
  participation: number;
};

const CIVIC_MEMBERS: CivicMember[] = [
  {
    address: "0x0000000000000000000000000000000000000001",
    displayName: "Sarah M.",
    statement: "Committed to civilian protection in conflict zones",
    participation: 0.82,
  },
  {
    address: "0x0000000000000000000000000000000000000002",
    displayName: "Dr. James Okafor",
    statement: "Supporting accountability in peacekeeping operations",
    participation: 0.76,
  },
  {
    address: "0x0000000000000000000000000000000000000003",
    displayName: "Maria Gonzalez",
    statement: "Humanitarian aid transparency matters",
    participation: 0.71,
  },
  {
    address: "0x0000000000000000000000000000000000000004",
    displayName: "Anonymous Donor",
    statement: "Standing with communities affected by conflict",
    participation: 0.65,
  },
  {
    address: "0x0000000000000000000000000000000000000005",
    displayName: "Aisha Rahman",
    statement: "Advocating for amends and reparations",
    participation: 0.88,
  },
  {
    address: "0x0000000000000000000000000000000000000006",
    displayName: "Michael Chen",
    statement: "Governance can strengthen humanitarian impact",
    participation: 0.74,
  },
  {
    address: "0x0000000000000000000000000000000000000007",
    displayName: "Elena Volkov",
    statement: "Every civilian voice counts",
    participation: 0.79,
  },
  {
    address: "0x0000000000000000000000000000000000000008",
    displayName: "Prof. Amina Diallo",
    statement: "Bridging research and community action",
    participation: 0.85,
  },
];

const now = new Date();

function makeStatement(text: string) {
  return {
    created_at: now,
    discord: null,
    endorsed: false,
    payload: { delegateStatement: text },
    signature: "civic-demo",
    twitter: null,
    updated_at: now,
    warpcast: null,
    scw_address: null,
  };
}

function makeDelegate(member: CivicMember): DelegateChunk {
  return {
    address: member.address,
    votingPower: {
      total: "1",
      direct: "1",
      advanced: "0",
    },
    participation: member.participation,
    statement: makeStatement(member.statement),
  };
}

export function getCivicDemoDelegates(): DelegateChunk[] {
  return CIVIC_MEMBERS.map(makeDelegate);
}

export function getCivicDemoDisplayName(address: string): string | undefined {
  if (!isCivicDemoEnabled()) {
    return undefined;
  }

  const member = CIVIC_MEMBERS.find(
    (entry) => entry.address.toLowerCase() === address.toLowerCase()
  );

  return member?.displayName;
}
