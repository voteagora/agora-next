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
