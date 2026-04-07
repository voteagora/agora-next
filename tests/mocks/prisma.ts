import { ACTIVE_PROPOSAL_ID, DEFEATED_PROPOSAL_ID } from "./handlers";

/**
 * DB-format proposal rows derived from real prod Optimism DAO Node responses.
 *
 * These mirror what `prismaWeb3Client.optimismProposals.findFirst()` returns
 * (the OptimismProposals view in schema.prisma). Field formats:
 *   - proposal_data   : parsed JSON object (Prisma returns Json as JS object)
 *   - proposal_results: parsed JSON object, shape { standard: { "0": against, "1": for, "2": abstain } }
 *   - proposal_type   : string enum ("OPTIMISTIC" | "STANDARD" | ...)
 */
const MOCK_PROPOSAL_DB_ROWS: Record<string, object> = {
  // Maintenance Upgrade: 18a  — optimistic, still active (end_block far future)
  [ACTIVE_PROPOSAL_ID]: {
    proposal_id: ACTIVE_PROPOSAL_ID,
    contract: "0xcdf27f107725988f2261ce2256bdfcde8b382b10",
    proposer: "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
    description:
      "# Maintenance Upgrade: 18a\n\nMaintena nce Upgrade Proposal 18a: Arena-Z Chain Servicer Migration.",
    ordinal: 0,
    created_block: BigInt("149174856"),
    start_block: "149174856",
    end_block: "999999999",
    cancelled_block: null,
    executed_block: null,
    queued_block: null,
    // decoded_proposal_data from DAO Node: [[disapprovalThresholdBps, isRelative]]
    // parseProposalData("OPTIMISTIC") reads [0][0] for disapprovalThreshold
    proposal_data: [[2000, true]],
    proposal_data_raw:
      "00000000000000000000000000000000000000000000000000000000000007d00000000000000000000000000000000000000000000000000000000000000001",
    proposal_type: "OPTIMISTIC",
    proposal_type_data: {
      proposal_type_id: 2,
      name: "Optimistic",
      quorum: "0",
      approval_threshold: "0",
    },
    // parseProposalResults reads .standard["0"]=against, ["1"]=for, ["2"]=abstain
    proposal_results: {
      standard: {
        "0": "387639362177943064311930",
        "1": "0",
        "2": "0",
      },
      approval: null,
    },
    created_transaction_hash: null,
    cancelled_transaction_hash: null,
    queued_transaction_hash: null,
    executed_transaction_hash: null,
  },

  // Protocol Upgrade #7: Fault Proofs  — standard, defeated (past end_block)
  [DEFEATED_PROPOSAL_ID]: {
    proposal_id: DEFEATED_PROPOSAL_ID,
    contract: "0xcdf27f107725988f2261ce2256bdfcde8b382b10",
    proposer: "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
    description:
      "# Protocol Upgrade #7: Fault Proofs\n\nThis proposal upgrades the OP Stack with Fault Proofs.",
    ordinal: 0,
    created_block: BigInt("120446190"),
    start_block: "120446190",
    end_block: "120705390",
    cancelled_block: null,
    executed_block: null,
    queued_block: null,
    // parseProposalData("STANDARD") reads .calldatas, .targets, .values, .signatures
    proposal_data: {
      calldatas: ["0x"],
      targets: ["0x0000000000000000000000000000000000000000"],
      values: [0],
      signatures: [""],
    },
    proposal_data_raw: null,
    proposal_type: "STANDARD",
    proposal_type_data: {
      proposal_type_id: 1,
      name: "Protocol Upgrade",
      quorum: "0",
      approval_threshold: "0",
    },
    proposal_results: {
      standard: {
        "0": "143925320406847793870874",
        "1": "58401924529657067214257463",
        "2": "2203327210608532560350316",
      },
      approval: null,
    },
    created_transaction_hash: null,
    cancelled_transaction_hash: null,
    queued_transaction_hash: null,
    executed_transaction_hash: null,
  },
};

const ALL_MOCK_PROPOSALS = () => Object.values(MOCK_PROPOSAL_DB_ROWS);

const createOptimismProposalsMock = () => ({
  findFirst: async ({ where }: { where?: Record<string, any> } = {}) => {
    // findProposal: { where: { proposal_id, contract } }
    if (where?.proposal_id && MOCK_PROPOSAL_DB_ROWS[where.proposal_id]) {
      return MOCK_PROPOSAL_DB_ROWS[where.proposal_id];
    }
    // findOffchainProposal: { where: { proposal_data: { path, equals } } } — no offchain for these
    return null;
  },
  findMany: async ({
    where,
    skip = 0,
    take,
  }: {
    where?: Record<string, any>;
    skip?: number;
    take?: number;
    select?: any;
    orderBy?: any;
  } = {}) => {
    let rows = ALL_MOCK_PROPOSALS();

    // Filter by cancelled_block: null means "only non-cancelled" (relevant filter)
    if (where && "cancelled_block" in where && where.cancelled_block === null) {
      rows = rows.filter((r: any) => (r as any).cancelled_block === null);
    }

    // Apply pagination
    const start = skip ?? 0;
    const sliced =
      take !== undefined ? rows.slice(start, start + take) : rows.slice(start);
    return sliced;
  },
  count: async () => Object.keys(MOCK_PROPOSAL_DB_ROWS).length,
  aggregate: async () => ({
    _count: { proposal_id: Object.keys(MOCK_PROPOSAL_DB_ROWS).length },
  }),
  create: async () => null,
  update: async () => null,
  upsert: async () => null,
  delete: async () => null,
  deleteMany: async () => ({ count: 0 }),
  updateMany: async () => ({ count: 0 }),
  createMany: async () => ({ count: 0 }),
});

const createEmptyModel = () => ({
  findFirst: async () => null,
  findMany: async () => [],
  count: async () => 0,
  aggregate: async () => ({ _count: {} }),
  create: async () => null,
  update: async () => null,
  upsert: async () => null,
  delete: async () => null,
  deleteMany: async () => ({ count: 0 }),
  updateMany: async () => ({ count: 0 }),
  createMany: async () => ({ count: 0 }),
});

/**
 * Creates a mock Prisma client that intercepts DB queries during E2E tests.
 *
 * Works by setting `global.prismaWeb2Client` and `global.prismaWeb3Client`
 * in `instrumentation.ts` before `prisma.ts` is first imported.
 * The guard `if (!global.prismaWeb2Client)` in `prisma.ts` ensures that
 * the real DB connection is never attempted.
 */
const clientMethods: Record<string, (...args: any[]) => any> = {
  $queryRaw: async () => [],
  $queryRawUnsafe: async () => [],
  $executeRaw: async () => 0,
  $executeRawUnsafe: async () => 0,
  $transaction: async (arg: any) =>
    Array.isArray(arg) ? Promise.all(arg) : arg(createMockPrismaClient()),
  $connect: async () => {},
  $disconnect: async () => {},
  $on: () => {},
  $use: () => {},
  $extends: () => createMockPrismaClient(),
};

export const createMockPrismaClient = () => {
  return new Proxy(
    {},
    {
      get(_target, modelName: string) {
        if (modelName in clientMethods) {
          return clientMethods[modelName as keyof typeof clientMethods];
        }
        if (modelName === "optimismProposals") {
          return createOptimismProposalsMock();
        }
        return createEmptyModel();
      },
    }
  );
};
