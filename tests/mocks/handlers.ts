import { http, HttpResponse } from "msw";

/**
 * MSW request handlers for E2E testing.
 * These intercept all outbound fetch() calls made by the Next.js server process
 * (SSR, server components, API routes) when ENABLE_E2E_MOCKS=true.
 *
 * Uses regex patterns so the handlers match regardless of the
 * DAONODE_URL_TEMPLATE value or base URL prefix.
 */

// Real prod proposal IDs (Optimism mainnet)
export const ACTIVE_PROPOSAL_ID =
  "110948310631668002494655523672605199071080002798996161216359486967766933533434";
export const DEFEATED_PROPOSAL_ID =
  "72085170435228531173144599119267762084652443676555508407874836206178427511368";

// Seven live-API test proposals (real Optimism governance proposal IDs)
export const PROPOSAL_UNKNOWN_1_ID =
  "95125315478676153337636309965804486010918292377915044655013986825087199254978";
export const PROPOSAL_SECURITY_COUNCIL_COHORT_A_ID =
  "28197030874936103651584757576099649781961082558352101632047737121219887503363";
export const PROPOSAL_DEV_ADVISORY_BOARD_MISSION_ID =
  "43611390841042156127733279917289923399354155784945103358272334363949369459237";
export const PROPOSAL_UNKNOWN_2_ID =
  "104254402796183118613790552174556993080165650973960750641671478192868760878324";
export const PROPOSAL_S8_INTENT_RATIFICATION_ID =
  "77379844029098348047245706083901850540159595802129942495264753179306805786028";
export const PROPOSAL_DEV_ADVISORY_BOARD_ELECTION_ID =
  "104658512477211447238723406913978051219515164565395855005009394415444207632959";
export const PROPOSAL_MAINTENANCE_UPGRADE_16A_ID =
  "32872683835969469583703720873380428072981331285364097246290907925181946140808";

// ── DAO Node: Single proposal by ID ─────────────────────────────────
const proposalTestActive = http.get(
  new RegExp(`\\/v1\\/proposals\\/${ACTIVE_PROPOSAL_ID}$`),
  () =>
    HttpResponse.json({
      id: ACTIVE_PROPOSAL_ID,
      proposer: "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
      description:
        "# Maintenance Upgrade: 18a\n\nMaintenance Upgrade Proposal 18a: Arena-Z Chain Servicer Migration.",
      block_number: "149174856",
      start_block: 149174856,
      end_block: 999999999,
      voting_module_name: "optimistic",
      proposal_type: 2,
      proposal_data:
        "00000000000000000000000000000000000000000000000000000000000007d00000000000000000000000000000000000000000000000000000000000000001",
      decoded_proposal_data: [[2000, true]],
      cancel_event: null,
      execute_event: null,
      queue_event: null,
      totals: { "no-param": { "0": "387639362177943064311930" } },
    })
);

const proposalTestDefeated = http.get(
  new RegExp(`\\/v1\\/proposals\\/${DEFEATED_PROPOSAL_ID}$`),
  () =>
    HttpResponse.json({
      id: DEFEATED_PROPOSAL_ID,
      proposer: "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
      description:
        "# Protocol Upgrade #7: Fault Proofs\n\nThis proposal upgrades the OP Stack with Fault Proofs.",
      block_number: "120446190",
      start_block: 120446190,
      end_block: 120705390,
      voting_module_name: "standard",
      proposal_type: 1,
      proposal_data: null,
      cancel_event: null,
      execute_event: null,
      queue_event: null,
      totals: {
        "no-param": {
          "0": "143925320406847793870874",
          "1": "58401924529657067214257463",
          "2": "2203327210608532560350316",
        },
      },
      targets: ["0x0000000000000000000000000000000000000000"],
      values: [0],
      signatures: [""],
      calldatas: [""],
    })
);

// ── Live-API test proposals: 7 real Optimism governance proposals ───

/** Shared proposer used across all live-API mock proposals */
const MOCK_PROPOSER = "0xe4553b743e74da3424ac51f8c1e586fd43ae226f";

/**
 * Shared vote totals that produce SUCCEEDED status for a standard proposal:
 * FOR (index "1") >> AGAINST (index "0")
 */
const STANDARD_SUCCEEDED_TOTALS = {
  "no-param": {
    "0": "2000000000000000000000000", // AGAINST: 2 M OP (raw)
    "1": "58000000000000000000000000", // FOR: 58 M OP (raw) → majority
    "2": "1000000000000000000000000", // ABSTAIN: 1 M OP (raw)
  },
};

/**
 * Optimistic vote totals with negligible against votes → SUCCEEDED.
 * Against must be < 50 % of votable supply (300 K OP mock supply).
 */
const OPTIMISTIC_SUCCEEDED_TOTALS = {
  "no-param": {
    "0": "387639362177943064311930", // ~387 K OP against (< 150 K? actually 387K > 150K)
    // Actually let's use a much smaller amount
  },
};

// NOTE: recalculate – mock votable supply = 300 000 OP = 300000000000000000000000
// 50% = 150000000000000000000000. Use against = 1M gwei = well below that.
const OPTIMISTIC_LOW_AGAINST_TOTALS = {
  "no-param": {
    "0": "1048876000000000000000000", // ~1.05 M OP against (< 150 M OP 50% threshold)
  },
};

// ── Proposal 1: unknown standard proposal ──────────────────────────
const proposalUnknown1 = http.get(
  new RegExp(`\\/v1\\/proposals\\/${PROPOSAL_UNKNOWN_1_ID}$`),
  () =>
    HttpResponse.json({
      id: PROPOSAL_UNKNOWN_1_ID,
      proposer: MOCK_PROPOSER,
      description:
        "# Governor Upgrade Proposal\n\nThis proposal upgrades the Optimism governor contract.",
      block_number: "1000",
      start_block: 1000,
      end_block: 1000, // past mock block → closed
      voting_module_name: "standard",
      proposal_type: 1,
      proposal_data: null,
      decoded_proposal_data: null,
      cancel_event: null,
      execute_event: null,
      queue_event: null,
      totals: STANDARD_SUCCEEDED_TOTALS,
      targets: ["0x0000000000000000000000000000000000000000"],
      values: [0],
      signatures: [""],
      calldatas: [""],
    })
);

// ── Proposal 2: Security Council Elections: Cohort A Lead (APPROVAL) ──
const proposalSecurityCouncilCohortA = http.get(
  new RegExp(`\\/v1\\/proposals\\/${PROPOSAL_SECURITY_COUNCIL_COHORT_A_ID}$`),
  () =>
    HttpResponse.json({
      id: PROPOSAL_SECURITY_COUNCIL_COHORT_A_ID,
      proposer: MOCK_PROPOSER,
      description:
        "# Security Council Elections: Cohort A Lead\n\nThis election selects the Security Council Lead for Cohort A of the Optimism Security Council.",
      block_number: "1000",
      start_block: 1000,
      end_block: 1000,
      voting_module_name: "approval",
      proposal_type: 3,
      proposal_data: null,
      // decoded_proposal_data is parsed by adaptDAONodeResponse as-is for approval
      // Format: [[...options...], [maxApprovals, criteria(1=TOP_CHOICES), budgetToken, criteriaValue, budgetAmount]]
      decoded_proposal_data: [
        [
          [
            ["0x0000000000000000000000000000000000000000"],
            ["0"],
            ["0x"],
            "Candidate A – Security Council Lead",
          ],
          [
            ["0x0000000000000000000000000000000000000000"],
            ["0"],
            ["0x"],
            "Candidate B – Security Council Lead",
          ],
        ],
        [
          "1",
          "1",
          "0x0000000000000000000000000000000000000000",
          "1",
          "0",
        ],
      ],
      cancel_event: null,
      execute_event: null,
      queue_event: null,
      totals: {
        "no-param": { "0": "0", "1": "0", "2": "0" },
        "0": { "1": "50000000000000000000000000" }, // 50 M OP for Candidate A
        "1": { "1": "30000000000000000000000000" }, // 30 M OP for Candidate B
      },
    })
);

// ── Proposal 3: S8 Governance Fund Mission: Developer Advisory Board (OPTIMISTIC) ──
const proposalDevAdvisoryBoardMission = http.get(
  new RegExp(
    `\\/v1\\/proposals\\/${PROPOSAL_DEV_ADVISORY_BOARD_MISSION_ID}$`
  ),
  () =>
    HttpResponse.json({
      id: PROPOSAL_DEV_ADVISORY_BOARD_MISSION_ID,
      proposer: MOCK_PROPOSER,
      description:
        "# S8 Governance Fund Mission: Developer Advisory Board\n\nThis proposal seeks to fund the Developer Advisory Board via the Governance Fund.",
      block_number: "1000",
      start_block: 1000,
      end_block: 1000,
      voting_module_name: "optimistic",
      proposal_type: 2,
      proposal_data:
        "00000000000000000000000000000000000000000000000000000000000007d00000000000000000000000000000000000000000000000000000000000000001",
      decoded_proposal_data: [[2000, true]],
      cancel_event: null,
      execute_event: null,
      queue_event: null,
      totals: OPTIMISTIC_LOW_AGAINST_TOTALS,
    })
);

// ── Proposal 4: unknown standard proposal ──────────────────────────
const proposalUnknown2 = http.get(
  new RegExp(`\\/v1\\/proposals\\/${PROPOSAL_UNKNOWN_2_ID}$`),
  () =>
    HttpResponse.json({
      id: PROPOSAL_UNKNOWN_2_ID,
      proposer: MOCK_PROPOSER,
      description:
        "# Season 8 Governance Proposal\n\nA governance proposal for Season 8 of the Optimism Collective.",
      block_number: "1000",
      start_block: 1000,
      end_block: 1000,
      voting_module_name: "standard",
      proposal_type: 1,
      proposal_data: null,
      decoded_proposal_data: null,
      cancel_event: null,
      execute_event: null,
      queue_event: null,
      totals: STANDARD_SUCCEEDED_TOTALS,
      targets: ["0x0000000000000000000000000000000000000000"],
      values: [0],
      signatures: [""],
      calldatas: [""],
    })
);

// ── Proposal 5: Season 8: Intent Ratification (STANDARD) ──────────
const proposalS8IntentRatification = http.get(
  new RegExp(`\\/v1\\/proposals\\/${PROPOSAL_S8_INTENT_RATIFICATION_ID}$`),
  () =>
    HttpResponse.json({
      id: PROPOSAL_S8_INTENT_RATIFICATION_ID,
      proposer: MOCK_PROPOSER,
      description:
        "# Season 8: Intent Ratification\n\nThis proposal ratifies the Intents for Season 8, establishing goals aligned with the Superchain Product Vision: Interoperability.",
      block_number: "1000",
      start_block: 1000,
      end_block: 1000,
      voting_module_name: "standard",
      proposal_type: 1,
      proposal_data: null,
      decoded_proposal_data: null,
      cancel_event: null,
      execute_event: null,
      queue_event: null,
      totals: STANDARD_SUCCEEDED_TOTALS,
      targets: ["0x0000000000000000000000000000000000000000"],
      values: [0],
      signatures: [""],
      calldatas: [""],
    })
);

// ── Proposal 6: Developer Advisory Board Election: Members (APPROVAL) ──
const proposalDevAdvisoryBoardElection = http.get(
  new RegExp(
    `\\/v1\\/proposals\\/${PROPOSAL_DEV_ADVISORY_BOARD_ELECTION_ID}$`
  ),
  () =>
    HttpResponse.json({
      id: PROPOSAL_DEV_ADVISORY_BOARD_ELECTION_ID,
      proposer: MOCK_PROPOSER,
      description:
        "# Developer Advisory Board Election: Members\n\nThis election selects 7 Members from 10 candidates for the Developer Advisory Board.",
      block_number: "1000",
      start_block: 1000,
      end_block: 1000,
      voting_module_name: "approval",
      proposal_type: 3,
      proposal_data: null,
      decoded_proposal_data: [
        [
          // 3 representative candidates (simplified from real 10)
          [
            ["0x0000000000000000000000000000000000000000"],
            ["0"],
            ["0x"],
            "DAB Candidate 1",
          ],
          [
            ["0x0000000000000000000000000000000000000000"],
            ["0"],
            ["0x"],
            "DAB Candidate 2",
          ],
          [
            ["0x0000000000000000000000000000000000000000"],
            ["0"],
            ["0x"],
            "DAB Candidate 3",
          ],
        ],
        [
          "7",
          "1",
          "0x0000000000000000000000000000000000000000",
          "1",
          "0",
        ],
      ],
      cancel_event: null,
      execute_event: null,
      queue_event: null,
      totals: {
        "no-param": { "0": "0", "1": "0", "2": "0" },
        "0": { "1": "40000000000000000000000000" },
        "1": { "1": "35000000000000000000000000" },
        "2": { "1": "30000000000000000000000000" },
      },
    })
);

// ── Proposal 7: Maintenance Upgrade: 16a (OPTIMISTIC) ──────────────
const proposalMaintenanceUpgrade16a = http.get(
  new RegExp(
    `\\/v1\\/proposals\\/${PROPOSAL_MAINTENANCE_UPGRADE_16A_ID}$`
  ),
  () =>
    HttpResponse.json({
      id: PROPOSAL_MAINTENANCE_UPGRADE_16A_ID,
      proposer: MOCK_PROPOSER,
      description:
        "# Maintenance Upgrade: 16a\n\nMaintenance release replacing Upgrade 16 — temporarily removes interop withdrawal-proving code introduced in U16 but not yet activated on mainnet.",
      block_number: "1000",
      start_block: 1000,
      end_block: 1000,
      voting_module_name: "optimistic",
      proposal_type: 2,
      proposal_data:
        "00000000000000000000000000000000000000000000000000000000000007d00000000000000000000000000000000000000000000000000000000000000001",
      decoded_proposal_data: [[2000, true]],
      cancel_event: null,
      execute_event: null,
      queue_event: null,
      totals: OPTIMISTIC_LOW_AGAINST_TOTALS,
    })
);

// ── GCS Archive: ENS proposals list (dao_node source) ──────────────
// The ENS tenant uses use-archive-for-proposals, which fetches NDJSON from
// Google Cloud Storage instead of calling the DAO Node directly.
// MSW intercepts these server-side fetch() calls.
// The app tries to gunzip the response; on failure it falls back to plain text,
// so we return plain NDJSON without compression.
const archiveEnsProposalsDaoNode = http.get(
  /storage\.googleapis\.com.*ens.*proposal_list\/dao_node/,
  () =>
    HttpResponse.text(
      [
        JSON.stringify({
          id: "1",
          title: "Mock Active Proposal",
          proposer: "0x1111111111111111111111111111111111111111",
          proposer_ens: null,
          start_blocktime: 1700000000,
          end_blocktime: 9999999999,
          start_block: 2000000,
          end_block: 90000000,
          data_eng_properties: { liveness: "live", source: "dao_node" },
          proposal_type: 0,
          voting_module_name: "standard",
          totals: { "no-param": { "0": "0", "1": "0", "2": "0" } },
        }),
        JSON.stringify({
          id: "2",
          title: "Mock Defeated Proposal",
          proposer: "0x2222222222222222222222222222222222222222",
          proposer_ens: null,
          start_blocktime: 1700000000,
          end_blocktime: 1700100000,
          start_block: 2000000,
          end_block: 3000000,
          data_eng_properties: { liveness: "archived", source: "dao_node" },
          proposal_type: 0,
          voting_module_name: "standard",
          totals: {
            "no-param": {
              "0": "1000000000000000000000000",
              "1": "0",
              "2": "0",
            },
          },
        }),
      ].join("\n")
    )
);

// ── GCS Archive: ENS proposals list (snapshot source) ──────────────
const archiveEnsProposalsSnapshot = http.get(
  /storage\.googleapis\.com.*ens.*proposal_list\/snapshot/,
  () => HttpResponse.text("")
);

// ── DAO Node: Proposals list ────────────────────────────────────────
const proposalsList = http.get(/\/v1\/proposals(\?|$)/, () =>
  HttpResponse.json({
    proposals: [
      {
        id: ACTIVE_PROPOSAL_ID,
        proposer: "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
        description:
          "# Maintenance Upgrade: 18a\n\nMaintenance Upgrade Proposal 18a: Arena-Z Chain Servicer Migration.",
        block_number: "149174856",
        start_block: 149174856,
        end_block: 999999999,
        voting_module_name: "optimistic",
        proposal_type: 2,
        proposal_data:
          "00000000000000000000000000000000000000000000000000000000000007d00000000000000000000000000000000000000000000000000000000000000001",
        decoded_proposal_data: [[2000, true]],
        cancel_event: null,
        execute_event: null,
        queue_event: null,
        totals: { "no-param": { "0": "387639362177943064311930" } },
      },
      {
        id: DEFEATED_PROPOSAL_ID,
        proposer: "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
        description:
          "# Protocol Upgrade #7: Fault Proofs\n\nThis proposal upgrades the OP Stack with Fault Proofs.",
        block_number: "120446190",
        start_block: 120446190,
        end_block: 120705390,
        voting_module_name: "standard",
        proposal_type: 1,
        proposal_data: null,
        cancel_event: null,
        execute_event: null,
        queue_event: null,
        totals: {
          "no-param": {
            "0": "143925320406847793870874",
            "1": "58401924529657067214257463",
            "2": "2203327210608532560350316",
          },
        },
        targets: ["0x0000000000000000000000000000000000000000"],
        values: [0],
        signatures: [""],
        calldatas: [""],
      },
    ],
  })
);

// ── JSON-RPC: Contract calls via fork node URL ─────────────────────
// Intercepts eth_call (and other JSON-RPC methods) from ethers.js providers
// when NEXT_PUBLIC_FORK_NODE_URL=http://localhost:9999/rpc is set.
// ethers.js v6 sends batch requests (array body), so we handle both formats.
const mockBlock = {
  number: "0x1000000",
  timestamp: "0x67000000",
  hash: "0x0000000000000000000000000000000000000000000000000000000000000001",
  parentHash:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  nonce: "0x0000000000000000",
  sha3Uncles:
    "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
  logsBloom: "0x" + "0".repeat(512),
  transactionsRoot:
    "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  stateRoot:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  receiptsRoot:
    "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  miner: "0x0000000000000000000000000000000000000000",
  difficulty: "0x0",
  totalDifficulty: "0x0",
  extraData: "0x",
  size: "0x0",
  gasLimit: "0x1c9c380",
  gasUsed: "0x0",
  transactions: [],
  uncles: [],
  baseFeePerGas: "0x1",
};

const getRpcResult = (method: string): unknown => {
  switch (method) {
    case "eth_call":
      // ABI-encoded uint256: 300000 OP (30% of 1M OP votable supply)
      // = 300000000000000000000000 = 0x3F870857A3E0E3800000
      return "0x000000000000000000000000000000000000000000003f870857a3e0e3800000";
    case "eth_blockNumber":
      return "0x1000000";
    case "eth_chainId":
      return "0xa"; // Optimism = 10
    case "net_version":
      return "10";
    case "eth_getBlockByNumber":
    case "eth_getBlockByHash":
      return mockBlock;
    case "eth_getTransactionCount":
      return "0x0";
    case "eth_getBalance":
      return "0x0";
    case "eth_estimateGas":
      return "0x5208";
    case "eth_gasPrice":
      return "0x1";
    default:
      return "0x0";
  }
};

const jsonRpc = http.post(/localhost:9999\/rpc/, async ({ request }) => {
  const body = await request.json();

  if (Array.isArray(body)) {
    // Batch request — respond with array, preserving each request's id
    return HttpResponse.json(
      body.map((req: { method: string; id: number; jsonrpc: string }) => ({
        jsonrpc: "2.0",
        id: req.id,
        result: getRpcResult(req.method),
      }))
    );
  }

  // Single request
  const req = body as { method: string; id: number; jsonrpc: string };
  return HttpResponse.json({
    jsonrpc: "2.0",
    id: req.id,
    result: getRpcResult(req.method),
  });
});

// ── DAO Node: Proposal types ────────────────────────────────────────
const proposalTypes = http.get(/\/v1\/proposal_types/, () =>
  HttpResponse.json({
    proposal_types: {
      "0": { name: "Governance Fund", quorum: "0", approval_threshold: "0" },
      "1": { name: "Protocol Upgrade", quorum: "0", approval_threshold: "0" },
      "2": { name: "Optimistic", quorum: "0", approval_threshold: "0" },
      "3": { name: "Approval", quorum: "0", approval_threshold: "0" },
    },
  })
);

// ── DAO Node: Voting power / votable supply ─────────────────────────
const votingPower = http.get(/\/v1\/voting_power/, () =>
  HttpResponse.json({
    voting_power: "1000000000000000000000000",
  })
);

// ── DAO Node: Delegates list ────────────────────────────────────────
const delegatesList = http.get(/\/v1\/delegates(\?|$)/, () =>
  HttpResponse.json({
    count: 2,
    delegates: [
      {
        addr: "delegate-1.eth",
        VP: "1000000000000000000000000",
        DC: 50,
      },
      {
        addr: "delegate-2.eth",
        VP: "0",
        DC: 0,
      },
    ],
  })
);

// ── DAO Node: Single delegate ───────────────────────────────────────
const delegateDetail = http.get(/\/v1\/delegate\/.+/, () =>
  HttpResponse.json({
    delegate: {
      address: "delegate-1.eth",
      voting_power: "1000000000000000000000000",
      delegators_count: 50,
    },
  })
);

// ── Upstash Redis ───────────────────────────────────────────────────
const upstashGet = http.get(/\/upstash/, () =>
  HttpResponse.json({ result: null })
);

const upstashPost = http.post(/\/upstash/, () =>
  HttpResponse.json({ result: null })
);

// ── Catch-all POST (e.g. transaction submissions) ───────────────────
const catchAllPost = http.post(/\/v1\//, () =>
  HttpResponse.json({ success: true, transactionHash: "0xabc123" })
);

// Export handlers in order — more specific routes first
export const handlers = [
  // Upstash
  upstashGet,
  upstashPost,
  // JSON-RPC contract calls (fork node)
  jsonRpc,
  // GCS Archive (ENS tenant uses these for proposals list)
  archiveEnsProposalsDaoNode,
  archiveEnsProposalsSnapshot,
  // Proposals (specific before list)
  proposalTestActive,
  proposalTestDefeated,
  // Live-API test proposals
  proposalUnknown1,
  proposalSecurityCouncilCohortA,
  proposalDevAdvisoryBoardMission,
  proposalUnknown2,
  proposalS8IntentRatification,
  proposalDevAdvisoryBoardElection,
  proposalMaintenanceUpgrade16a,
  proposalsList,
  // Proposal types
  proposalTypes,
  // Voting power
  votingPower,
  // Delegates
  delegateDetail,
  delegatesList,
  // Catch-all
  catchAllPost,
];
