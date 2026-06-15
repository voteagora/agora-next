import { isCivicDemoEnabled } from "@/mocks/civicDemoProposals";
import {
  MEDIATION_FORUM_OPENER,
  MEDIATION_FORUM_TITLE,
} from "@/mocks/civicDemoMediationFlow";
import {
  ARTIST_FORUM_OPENER,
  ARTIST_FORUM_TITLE,
  INITIATIVE_FORUM_OPENER,
  INITIATIVE_FORUM_TITLE,
  SUPPORTER_FORUM_OPENER,
} from "@/mocks/civicDemoSupporterParticipation";

const MARIO_ADDRESS = "0x0000000000000000000000000000000000000008";
const SARAH_ADDRESS = "0x0000000000000000000000000000000000000001";
const JAMES_ADDRESS = "0x0000000000000000000000000000000000000002";
const MARIA_ADDRESS = "0x0000000000000000000000000000000000000003";
const AISHA_ADDRESS = "0x0000000000000000000000000000000000000005";
const MICHAEL_ADDRESS = "0x0000000000000000000000000000000000000006";
const ELENA_ADDRESS = "0x0000000000000000000000000000000000000007";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

type CivicForumPost = {
  id: number;
  topicId: number;
  address: string;
  content: string;
  createdAt: Date;
  parentPostId?: number | null;
  reactions: Array<{ emoji: string; address: string }>;
  attachments: [];
  votes: Array<{ vote: number }>;
};

type CivicForumTopic = {
  id: number;
  title: string;
  address: string;
  categoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  isNsfw: boolean;
  deletedAt: null;
  revealTime: null;
  expirationTime: null;
  isFinancialStatement: boolean;
  posts: CivicForumPost[];
  category: {
    id: number;
    name: string;
    adminOnlyTopics: boolean;
    isDuna: boolean;
  } | null;
};

const CIVIC_FORUM_CATEGORIES = [
  {
    id: 1,
    name: "Field Programs",
    description: "Updates and coordination from CIVIC field teams",
    archived: false,
    adminOnlyTopics: false,
    createdAt: daysAgo(120),
    updatedAt: daysAgo(120),
    isDuna: false,
    topicsCount: 3,
  },
  {
    id: 2,
    name: "Advocacy & Policy",
    description:
      "Policy briefings, advocacy priorities, and stakeholder feedback",
    archived: false,
    adminOnlyTopics: false,
    createdAt: daysAgo(120),
    updatedAt: daysAgo(120),
    isDuna: false,
    topicsCount: 3,
  },
  {
    id: 3,
    name: "Community Governance",
    description: "Member discussions on governance priorities and pilot voting",
    archived: false,
    adminOnlyTopics: false,
    createdAt: daysAgo(120),
    updatedAt: daysAgo(120),
    isDuna: false,
    topicsCount: 7,
  },
  {
    id: 4,
    name: "General",
    description: "Open community conversation and organizational updates",
    archived: false,
    adminOnlyTopics: false,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(90),
    isDuna: false,
    topicsCount: 2,
  },
];

const CIVIC_FORUM_TOPICS: CivicForumTopic[] = [
  {
    id: 1001,
    title: "Lessons from Ukraine field deployment — February 2026",
    address: MARIO_ADDRESS,
    categoryId: 1,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(2),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 1,
      name: "Field Programs",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10001,
        topicId: 1001,
        address: MARIO_ADDRESS,
        content:
          "Our Ukraine team completed a three-week deployment focused on civilian harm documentation and local partner coordination. Key takeaway: communities want faster reporting channels and clearer escalation paths when incidents occur near frontline areas.\n\nI'd like member input on whether we should prioritize mobile reporting kits or community liaison training in Q3.",
        createdAt: daysAgo(6),
        reactions: [{ emoji: "👍", address: SARAH_ADDRESS }],
        attachments: [],
        votes: [{ vote: 1 }, { vote: 1 }, { vote: 1 }],
      },
      {
        id: 10002,
        topicId: 1001,
        address: SARAH_ADDRESS,
        content:
          "Thank you for this update, Mario. The mobile reporting kits seem especially urgent given connectivity challenges in several oblasts. Happy to help review requirements if useful.",
        createdAt: daysAgo(5),
        reactions: [],
        attachments: [],
        votes: [],
      },
      {
        id: 10003,
        topicId: 1001,
        address: JAMES_ADDRESS,
        content:
          "Strong support for liaison training as well — local trust is essential for credible documentation. Could we pilot both at different sites?",
        createdAt: daysAgo(4),
        reactions: [{ emoji: "💯", address: MARIO_ADDRESS }],
        attachments: [],
        votes: [],
      },
    ],
  },
  {
    id: 1002,
    title: "UN Security Council briefing feedback thread",
    address: SARAH_ADDRESS,
    categoryId: 2,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(3),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 2,
      name: "Advocacy & Policy",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10011,
        topicId: 1002,
        address: SARAH_ADDRESS,
        content:
          "CIVIC briefed UN Security Council members last week on civilian protection trends in urban conflict. Several delegations asked for clearer recommendations on accountability mechanisms.\n\nPlease share reactions or suggested follow-up points we should emphasize in upcoming bilateral meetings.",
        createdAt: daysAgo(8),
        reactions: [{ emoji: "🙏", address: MARIA_ADDRESS }],
        attachments: [],
        votes: [{ vote: 1 }, { vote: 1 }],
      },
      {
        id: 10012,
        topicId: 1002,
        address: MARIA_ADDRESS,
        content:
          "Recommend emphasizing independent review of harm incidents — several members responded positively when we framed it as strengthening mission credibility.",
        createdAt: daysAgo(7),
        reactions: [],
        attachments: [],
        votes: [],
      },
      {
        id: 10013,
        topicId: 1002,
        address: ELENA_ADDRESS,
        content:
          "Agree on independent review. We should also reference recent Sahel data to show this is a cross-regional issue, not isolated to one theater.",
        createdAt: daysAgo(6),
        reactions: [],
        attachments: [],
        votes: [],
      },
    ],
  },
  {
    id: 1003,
    title: "Draft: Q3 funding priorities discussion",
    address: JAMES_ADDRESS,
    categoryId: 3,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 3,
      name: "Community Governance",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10021,
        topicId: 1003,
        address: JAMES_ADDRESS,
        content:
          "Before the formal Q3 allocation vote, I'd like to gather member perspectives on priority regions and program types.\n\nCurrent draft priorities:\n1. Ukraine and Yemen civilian protection funds\n2. Urban warfare documentation capacity\n3. Partner training in the Sahel\n\nWhat would you reorder or add?",
        createdAt: daysAgo(10),
        reactions: [{ emoji: "👀", address: AISHA_ADDRESS }],
        attachments: [],
        votes: [{ vote: 1 }, { vote: 1 }, { vote: 1 }, { vote: 1 }],
      },
      {
        id: 10022,
        topicId: 1003,
        address: AISHA_ADDRESS,
        content:
          "Urban documentation capacity feels underweighted given recent reporting gaps. I'd move that to #1.",
        createdAt: daysAgo(9),
        reactions: [],
        attachments: [],
        votes: [],
      },
      {
        id: 10023,
        topicId: 1003,
        address: MARIO_ADDRESS,
        content:
          "Support keeping Ukraine/Yemen at the top while increasing the documentation line item. Field teams are asking for better tools, not just more travel.",
        createdAt: daysAgo(7),
        reactions: [{ emoji: "👍", address: JAMES_ADDRESS }],
        attachments: [],
        votes: [],
      },
    ],
  },
  {
    id: 1004,
    title: MEDIATION_FORUM_TITLE,
    address: JAMES_ADDRESS,
    categoryId: 3,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 3,
      name: "Community Governance",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10031,
        topicId: 1004,
        address: JAMES_ADDRESS,
        content: MEDIATION_FORUM_OPENER,
        createdAt: daysAgo(10),
        reactions: [
          { emoji: "👍", address: MARIO_ADDRESS },
          { emoji: "👍", address: SARAH_ADDRESS },
          { emoji: "💯", address: MARIA_ADDRESS },
        ],
        attachments: [],
        votes: [
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
        ],
      },
      {
        id: 10032,
        topicId: 1004,
        address: MARIO_ADDRESS,
        content:
          "Strong support for exploring this. From a partnerships perspective, several donors have asked whether CIVIC can demonstrate structured de-escalation capacity — not just documentation after the fact.\n\nMediation must remain **community-led**. CIVIC's role should be facilitation standards, training, and evaluation — not direct negotiation.",
        createdAt: daysAgo(9),
        reactions: [{ emoji: "👍", address: JAMES_ADDRESS }],
        attachments: [],
        votes: [],
      },
      {
        id: 10033,
        topicId: 1004,
        address: SARAH_ADDRESS,
        content:
          "Agree with Mario. Any pilot needs explicit **safety protocols** for local mediators and clear exit conditions if tensions escalate. I'd also want independent evaluation criteria published before the temp check opens.",
        createdAt: daysAgo(8),
        reactions: [{ emoji: "🙏", address: AISHA_ADDRESS }],
        attachments: [],
        votes: [],
      },
      {
        id: 10034,
        topicId: 1004,
        address: MARIA_ADDRESS,
        content:
          "Humanitarian transparency angle: if we pursue this, member reporting on pilot outcomes should be public. Partners need to trust that CIVIC won't overstate impact.",
        createdAt: daysAgo(7),
        reactions: [],
        attachments: [],
        votes: [],
      },
      {
        id: 10035,
        topicId: 1004,
        address: AISHA_ADDRESS,
        content:
          "Regional priority: **Yemen** should be phase one alongside Ukraine. Our Sahel partners have similar needs but I'd sequence after we prove the model in two theaters first.",
        createdAt: daysAgo(6),
        reactions: [{ emoji: "👍", address: JAMES_ADDRESS }],
        attachments: [],
        votes: [],
      },
      {
        id: 10036,
        topicId: 1004,
        address: MICHAEL_ADDRESS,
        content:
          "Before the temp check — can we get a rough budget range? Even a placeholder helps members understand scope. Happy to support if the pilot stays under $200K for year one.",
        createdAt: daysAgo(5),
        reactions: [],
        attachments: [],
        votes: [],
      },
      {
        id: 10037,
        topicId: 1004,
        address: JAMES_ADDRESS,
        content:
          "Thanks everyone — this is exactly the input I needed.\n\n**Summary of thread so far:**\n- Strong support for a limited pilot with community-led mediation\n- Ukraine + Yemen as phase 1 regions\n- Non-negotiable: safety protocols, independent evaluation, source protection\n- Budget target: ~$180K (will detail in governance proposal)\n\nI'll open the **temp check** this week. If it passes, the formal gov proposal will follow.",
        createdAt: daysAgo(4),
        reactions: [
          { emoji: "👍", address: MARIO_ADDRESS },
          { emoji: "👍", address: SARAH_ADDRESS },
          { emoji: "👍", address: MARIA_ADDRESS },
        ],
        attachments: [],
        votes: [],
      },
      {
        id: 10038,
        topicId: 1004,
        address: JAMES_ADDRESS,
        content:
          "**Update:** The temp check is now live — [Temp Check: Local Mediation Support Pilot](/proposals/civic-demo-7). Please vote if you haven't already. Discussion stays open here for implementation questions.",
        createdAt: daysAgo(2),
        reactions: [{ emoji: "🎉", address: ELENA_ADDRESS }],
        attachments: [],
        votes: [],
      },
      {
        id: 10039,
        topicId: 1004,
        address: SARAH_ADDRESS,
        content:
          "Voted For on the temp check. Looking forward to the governance proposal — the safeguards section James outlined gives me confidence.",
        createdAt: daysAgo(1),
        reactions: [],
        attachments: [],
        votes: [],
      },
    ],
  },
  {
    id: 1005,
    title: "Discussion: Quarterly town halls with field teams",
    address: AISHA_ADDRESS,
    categoryId: 3,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(2),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 3,
      name: "Community Governance",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10041,
        topicId: 1005,
        address: AISHA_ADDRESS,
        content:
          "Would members support **quarterly virtual town halls** where field teams present updates and take live questions?\n\nGoal: improve transparency between Geneva HQ, field offices, and the member community without adding heavy governance overhead.\n\nIf this discussion gets traction, I'll propose a temp check to formalize the format and budget.",
        createdAt: daysAgo(7),
        reactions: [{ emoji: "🎉", address: MARIA_ADDRESS }],
        attachments: [],
        votes: [{ vote: 1 }, { vote: 1 }, { vote: 1 }],
      },
      {
        id: 10042,
        topicId: 1005,
        address: MARIA_ADDRESS,
        content:
          "Strong yes — recordings should be posted afterward for members in different time zones.",
        createdAt: daysAgo(3),
        reactions: [],
        attachments: [],
        votes: [],
      },
    ],
  },
  {
    id: 1006,
    title: "Sahel region protection training — partner coordination",
    address: ELENA_ADDRESS,
    categoryId: 1,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(5),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 1,
      name: "Field Programs",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10051,
        topicId: 1006,
        address: ELENA_ADDRESS,
        content:
          "We're coordinating a Sahel protection training series with three local NGOs. Looking for members with regional expertise to review the curriculum outline before we finalize dates.",
        createdAt: daysAgo(12),
        reactions: [],
        attachments: [],
        votes: [{ vote: 1 }],
      },
      {
        id: 10052,
        topicId: 1006,
        address: JAMES_ADDRESS,
        content:
          "Happy to review. Please include modules on documenting harm incidents in low-connectivity environments.",
        createdAt: daysAgo(11),
        reactions: [],
        attachments: [],
        votes: [],
      },
    ],
  },
  {
    id: 1007,
    title: "Urban warfare documentation standards — community input",
    address: MARIA_ADDRESS,
    categoryId: 2,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(1),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 2,
      name: "Advocacy & Policy",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10061,
        topicId: 1007,
        address: MARIA_ADDRESS,
        content:
          "CIVIC is updating its urban warfare documentation standards. This thread collects member feedback ahead of the formal proposal on the Community Reporting Framework.\n\nKey questions:\n- Minimum verification steps before public release\n- Protections for civilian sources\n- Coordination with partner organizations",
        createdAt: daysAgo(5),
        reactions: [{ emoji: "👍", address: SARAH_ADDRESS }],
        attachments: [],
        votes: [{ vote: 1 }, { vote: 1 }],
      },
      {
        id: 10062,
        topicId: 1007,
        address: SARAH_ADDRESS,
        content:
          "Source protection should be non-negotiable. Recommend explicit redaction guidelines and a single approval path for sensitive incidents.",
        createdAt: daysAgo(4),
        reactions: [],
        attachments: [],
        votes: [],
      },
    ],
  },
  {
    id: 1008,
    title: "Yemen access constraints — February field team debrief",
    address: MICHAEL_ADDRESS,
    categoryId: 1,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(3),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 1,
      name: "Field Programs",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10071,
        topicId: 1008,
        address: MICHAEL_ADDRESS,
        content:
          "Our Yemen team reports increasing access constraints in several governorates. Sharing a debrief on partner coordination challenges and proposed adjustments to Q2 field plans.",
        createdAt: daysAgo(9),
        reactions: [],
        attachments: [],
        votes: [{ vote: 1 }],
      },
      {
        id: 10072,
        topicId: 1008,
        address: MARIO_ADDRESS,
        content:
          "Thanks Michael. Please flag any locations where documentation work should pause until safety conditions improve.",
        createdAt: daysAgo(8),
        reactions: [],
        attachments: [],
        votes: [],
      },
    ],
  },
  {
    id: 1009,
    title: "Partner NGO onboarding — process improvements",
    address: MARIA_ADDRESS,
    categoryId: 3,
    createdAt: daysAgo(11),
    updatedAt: daysAgo(4),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 3,
      name: "Community Governance",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10081,
        topicId: 1009,
        address: MARIA_ADDRESS,
        content:
          "We're revising how CIVIC onboards new partner NGOs. Looking for member feedback on transparency requirements and reporting cadence before we finalize the policy update.",
        createdAt: daysAgo(11),
        reactions: [{ emoji: "👍", address: JAMES_ADDRESS }],
        attachments: [],
        votes: [{ vote: 1 }, { vote: 1 }],
      },
    ],
  },
  {
    id: 1010,
    title: "2026 advocacy messaging — member input on priorities",
    address: SARAH_ADDRESS,
    categoryId: 2,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(6),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 2,
      name: "Advocacy & Policy",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10091,
        topicId: 1010,
        address: SARAH_ADDRESS,
        content:
          "CIVIC's advocacy team is drafting 2026 messaging priorities. Which themes should we emphasize in briefings with policymakers — urban warfare, peacekeeping accountability, or humanitarian access?",
        createdAt: daysAgo(14),
        reactions: [],
        attachments: [],
        votes: [{ vote: 1 }, { vote: 1 }, { vote: 1 }],
      },
      {
        id: 10092,
        topicId: 1010,
        address: ELENA_ADDRESS,
        content:
          "Urban warfare documentation has strong momentum after recent UN engagement. I'd prioritize that while keeping peacekeeping accountability as a secondary track.",
        createdAt: daysAgo(13),
        reactions: [],
        attachments: [],
        votes: [],
      },
    ],
  },
  {
    id: 1011,
    title: "Welcome thread — CIVIC governance pilot",
    address: MARIO_ADDRESS,
    categoryId: 4,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(20),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 4,
      name: "General",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10101,
        topicId: 1011,
        address: MARIO_ADDRESS,
        content:
          "Welcome to the CIVIC governance pilot. This forum is where members discuss priorities before temp checks and formal votes. Introduce yourself and share what civilian protection issues matter most to you.",
        createdAt: daysAgo(30),
        reactions: [{ emoji: "👋", address: SARAH_ADDRESS }],
        attachments: [],
        votes: [{ vote: 1 }, { vote: 1 }, { vote: 1 }, { vote: 1 }],
      },
    ],
  },
  {
    id: 1012,
    title: "How the forum → temp check → proposal flow works",
    address: MARIO_ADDRESS,
    categoryId: 4,
    createdAt: daysAgo(25),
    updatedAt: daysAgo(15),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 4,
      name: "General",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10111,
        topicId: 1012,
        address: MARIO_ADDRESS,
        content:
          "Quick guide for new members:\n\n1. **Start a discussion** here in the forum to gather community input\n2. If there's strong support, open a **temp check** to gauge formal voting intent\n3. After a successful temp check, submit a **governance proposal** for a binding vote\n\nSee Dr. James Okafor's mediation discussion (topic #1004) for a live example of this flow.",
        createdAt: daysAgo(25),
        reactions: [{ emoji: "💯", address: JAMES_ADDRESS }],
        attachments: [],
        votes: [{ vote: 1 }, { vote: 1 }],
      },
    ],
  },
  {
    id: 1013,
    title: "How will supporters participate?",
    address: MARIO_ADDRESS,
    categoryId: 3,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(0),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 3,
      name: "Community Governance",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10121,
        topicId: 1013,
        address: MARIO_ADDRESS,
        content: SUPPORTER_FORUM_OPENER,
        createdAt: daysAgo(3),
        reactions: [{ emoji: "👍", address: SARAH_ADDRESS }],
        attachments: [],
        votes: [
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
          { vote: 1 },
        ],
      },
      {
        id: 10122,
        topicId: 1013,
        address: SARAH_ADDRESS,
        content:
          "The initiative thread is where the real debate is happening — see [Discussion: Q3 Supporter Initiative Funding Vote](/forums/1014/discussion-q3-supporter-initiative-funding-vote). I voted Ukraine on the [gov proposal](/proposals/civic-demo-example-a).",
        createdAt: daysAgo(2),
        reactions: [{ emoji: "💯", address: JAMES_ADDRESS }],
        attachments: [],
        votes: [],
      },
      {
        id: 10123,
        topicId: 1013,
        address: ELENA_ADDRESS,
        content:
          "For the artist side, join [Discussion: Next Artist Collaboration Vote](/forums/1015/discussion-next-artist-collaboration-vote). I went with Field Team Storytellers on the [gov proposal](/proposals/civic-demo-example-b).",
        createdAt: daysAgo(1),
        reactions: [],
        attachments: [],
        votes: [],
      },
      {
        id: 10124,
        topicId: 1013,
        address: JAMES_ADDRESS,
        content:
          "Both are useful demos. A tests whether **economic control** keeps donors engaged; B tests **content and sharing**. I'd show donors both URLs and ask which participation model they'd actually use.",
        createdAt: daysAgo(0),
        reactions: [{ emoji: "👍", address: MARIO_ADDRESS }],
        attachments: [],
        votes: [],
      },
    ],
  },
  {
    id: 1014,
    title: INITIATIVE_FORUM_TITLE,
    address: MARIO_ADDRESS,
    categoryId: 3,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(0),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 3,
      name: "Community Governance",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10131,
        topicId: 1014,
        address: MARIO_ADDRESS,
        content: INITIATIVE_FORUM_OPENER,
        createdAt: daysAgo(2),
        reactions: [{ emoji: "👍", address: SARAH_ADDRESS }],
        attachments: [],
        votes: [{ vote: 1 }, { vote: 1 }, { vote: 1 }, { vote: 1 }],
      },
      {
        id: 10132,
        topicId: 1014,
        address: SARAH_ADDRESS,
        content:
          "Ukraine rapid response. Field teams reported reporting gaps within 48 hours of incidents last month — this funding directly closes that loop.",
        createdAt: daysAgo(1),
        reactions: [],
        attachments: [],
        votes: [],
      },
      {
        id: 10133,
        topicId: 1014,
        address: AISHA_ADDRESS,
        content:
          "Sahel training expansion has the highest multiplier — 240 community leaders trained creates protection capacity that outlasts a single deployment cycle.",
        createdAt: daysAgo(1),
        reactions: [{ emoji: "💯", address: JAMES_ADDRESS }],
        attachments: [],
        votes: [],
      },
      {
        id: 10134,
        topicId: 1014,
        address: JAMES_ADDRESS,
        content:
          "Yemen documentation is underfunded relative to need. If we're testing **donor control over economic direction**, I'd watch whether Yemen picks up votes from members who haven't engaged before.",
        createdAt: daysAgo(0),
        reactions: [],
        attachments: [],
        votes: [],
      },
    ],
  },
  {
    id: 1015,
    title: ARTIST_FORUM_TITLE,
    address: ELENA_ADDRESS,
    categoryId: 3,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(0),
    archived: false,
    isNsfw: false,
    deletedAt: null,
    revealTime: null,
    expirationTime: null,
    isFinancialStatement: false,
    category: {
      id: 3,
      name: "Community Governance",
      adminOnlyTopics: false,
      isDuna: false,
    },
    posts: [
      {
        id: 10141,
        topicId: 1015,
        address: ELENA_ADDRESS,
        content: ARTIST_FORUM_OPENER,
        createdAt: daysAgo(1),
        reactions: [{ emoji: "👀", address: MARIA_ADDRESS }],
        attachments: [],
        votes: [{ vote: 1 }, { vote: 1 }, { vote: 1 }],
      },
      {
        id: 10142,
        topicId: 1015,
        address: MARIA_ADDRESS,
        content:
          "Field Team Storytellers residency — last year's external artist collab got press but didn't move donor retention. Community-led work felt authentic in member surveys.",
        createdAt: daysAgo(1),
        reactions: [],
        attachments: [],
        votes: [],
      },
      {
        id: 10143,
        topicId: 1015,
        address: MICHAEL_ADDRESS,
        content:
          "Forensic Architecture would be strongest for policy audiences and university partnerships. Different goal than engagement metrics, but high credibility.",
        createdAt: daysAgo(0),
        reactions: [],
        attachments: [],
        votes: [],
      },
    ],
  },
];

function groupByEmojiAddresses(
  reactions: CivicForumPost["reactions"]
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  reactions.forEach((reaction) => {
    const emoji = reaction.emoji.trim();
    const addr = reaction.address.toLowerCase();
    if (!emoji || !addr) return;
    if (!out[emoji]) out[emoji] = [];
    if (!out[emoji].includes(addr)) out[emoji].push(addr);
  });
  return out;
}

function mapTopicPosts(posts: CivicForumPost[]) {
  return posts.map((post) => ({
    ...post,
    createdAt: post.createdAt,
    reactions: post.reactions,
    reactionsByEmoji: groupByEmojiAddresses(post.reactions),
    attachments: post.attachments,
    votes: post.votes,
    isNsfw: false,
    deletedAt: null,
  }));
}

function processTopicForList(topic: CivicForumTopic) {
  const posts = mapTopicPosts(topic.posts);
  const firstPost = posts[0];

  return {
    ...topic,
    createdAt: topic.createdAt.toISOString(),
    revealTime: null,
    upvotes: firstPost?.votes?.filter((vote) => vote.vote === 1).length ?? 0,
    firstPost,
    postsCount: posts.length,
    posts,
    _count: { posts: posts.length },
  };
}

function filterTopicsByCategory(categoryId?: number) {
  if (categoryId === undefined) {
    return CIVIC_FORUM_TOPICS;
  }
  if (categoryId === 0) {
    return CIVIC_FORUM_TOPICS.filter((topic) => topic.categoryId === null);
  }
  return CIVIC_FORUM_TOPICS.filter((topic) => topic.categoryId === categoryId);
}

export function isCivicDemoForumTopic(topicId: number) {
  return (
    isCivicDemoEnabled() && CIVIC_FORUM_TOPICS.some((t) => t.id === topicId)
  );
}

export function getCivicDemoForumAdmins() {
  return {
    success: true as const,
    data: [{ address: MARIO_ADDRESS, role: "civic_exec" }],
  };
}

export function getCivicDemoForumCategories() {
  return {
    success: true as const,
    data: CIVIC_FORUM_CATEGORIES,
  };
}

export function getCivicDemoForumTopicsCount() {
  return {
    success: true as const,
    data: CIVIC_FORUM_TOPICS.length,
  };
}

export function getCivicDemoUncategorizedTopicsCount() {
  return {
    success: true as const,
    data: 0,
  };
}

export function getCivicDemoForumData({
  categoryId,
}: {
  categoryId?: number;
} = {}) {
  const filteredTopics = filterTopicsByCategory(categoryId);
  const processedTopics = filteredTopics.map(processTopicForList);
  const latestTopic = [...CIVIC_FORUM_TOPICS].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )[0];
  const latestPost = latestTopic?.posts[latestTopic.posts.length - 1];

  return {
    success: true as const,
    data: {
      topics: processedTopics,
      totalCount: CIVIC_FORUM_TOPICS.length,
      admins: { [MARIO_ADDRESS.toLowerCase()]: "civic_exec" },
      categories: CIVIC_FORUM_CATEGORIES.map((category) => ({
        ...category,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      })),
      uncategorizedCount: 0,
      latestPost: latestPost
        ? {
            id: latestPost.id,
            author: latestPost.address,
            content: latestPost.content,
            createdAt: latestPost.createdAt.toISOString(),
            parentId: undefined,
            attachments: undefined,
            deletedAt: null,
            deletedBy: null,
            isNsfw: false,
            reactionsByEmoji: undefined,
          }
        : undefined,
    },
  };
}

export function getCivicDemoForumTopic(topicId: number) {
  const topic = CIVIC_FORUM_TOPICS.find((entry) => entry.id === topicId);
  if (!topic) {
    return {
      success: false as const,
      error: "Topic not found",
    };
  }

  const posts = mapTopicPosts(topic.posts);

  return {
    success: true as const,
    data: {
      ...topic,
      createdAt:
        topic.createdAt instanceof Date
          ? topic.createdAt.toISOString()
          : topic.createdAt,
      updatedAt:
        topic.updatedAt instanceof Date
          ? topic.updatedAt.toISOString()
          : topic.updatedAt,
      posts,
      topicReactionsByEmoji: groupByEmojiAddresses(posts[0]?.reactions ?? []),
    },
  };
}

export function getCivicDemoForumTopicsByUser(
  address: string,
  pagination: { limit: number; offset: number }
) {
  const normalizedAddress = address.toLowerCase();
  const userTopics = CIVIC_FORUM_TOPICS.filter(
    (topic) => topic.address.toLowerCase() === normalizedAddress
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const { limit, offset } = pagination;
  const slice = userTopics.slice(offset, offset + limit + 1);
  const hasNext = slice.length > limit;
  const data = slice.slice(0, limit).map((topic) => {
    const posts = mapTopicPosts(topic.posts);
    return {
      ...topic,
      posts,
      postsCount: posts.length,
      _count: { posts: posts.length },
    };
  });

  return {
    success: true as const,
    data: {
      meta: {
        has_next: hasNext,
        total_returned: data.length,
        next_offset: hasNext ? offset + limit : 0,
      },
      data,
    },
  };
}

export function getCivicDemoForumPostsByUser(
  address: string,
  pagination: { limit: number; offset: number }
) {
  const normalizedAddress = address.toLowerCase();
  const allPosts = CIVIC_FORUM_TOPICS.flatMap((topic) =>
    topic.posts
      .filter((post) => post.address.toLowerCase() === normalizedAddress)
      .map((post) => ({
        ...post,
        topic: {
          id: topic.id,
          title: topic.title,
          category: topic.category
            ? { id: topic.category.id, name: topic.category.name }
            : null,
        },
        reactionsByEmoji: groupByEmojiAddresses(post.reactions),
        attachments: [],
        isNsfw: false,
      }))
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const { limit, offset } = pagination;
  const slice = allPosts.slice(offset, offset + limit + 1);
  const hasNext = slice.length > limit;
  const data = slice.slice(0, limit);

  return {
    success: true as const,
    data: {
      meta: {
        has_next: hasNext,
        total_returned: data.length,
        next_offset: hasNext ? offset + limit : 0,
      },
      data,
    },
  };
}
