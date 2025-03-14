import prisma from "@/app/lib/prisma";
import { TENANT_NAMESPACES } from "./constants";
import { TenantNamespace } from "./types";

export function findDelagatee({
  namespace,
  address,
  contract,
}: {
  namespace: TenantNamespace;
  address: string;
  contract?: string;
}) {
  const condition = {
    where: {
      delegator: address.toLowerCase(),
      contract,
    },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.ENS:
      return prisma.ensDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3Delegatees.findFirst(condition);
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoDelegatees.findFirst(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findAdvancedDelegatee({
  namespace,
  address,
  contract,
}: {
  namespace: TenantNamespace;
  address: string;
  contract?: string;
}) {
  const condition = {
    where: {
      from: address.toLowerCase(),
      delegated_amount: { gt: 0 },
      contract,
    },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.ENS:
      return prisma.ensAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3AdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoAdvancedDelegatees.findMany(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findVotableSupply({
  namespace,
  address,
}: {
  namespace: TenantNamespace;
  address: string;
}) {
  const condition = {
    where: { address },
    select: {
      votable_supply: true,
    },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismVotableSupply.findFirst({});
    case TENANT_NAMESPACES.ENS:
      return prisma.ensVotableSupply.findFirst({});
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiVotableSupply.findFirst({});
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapVotableSupply.findFirst({});
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberVotableSupply.findFirst({});
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollVotableSupply.findFirst({});
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveVotableSupply.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildVotableSupply.findFirst({});
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostVotableSupply.findFirst({});
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiVotableSupply.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3VotableSupply.findFirst({});
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoVotableSupply.findFirst({});
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findProposalsQueryFromDB({
  namespace,
  skip,
  take,
  filter,
  contract,
}: {
  namespace: TenantNamespace;
  skip: number;
  take: number;
  filter: string;
  contract: string;
}) {
  const condition = {
    take,
    skip,
    orderBy: {
      ordinal: "desc" as const,
    },
    where: {
      contract,
      cancelled_block: filter === "relevant" ? null : undefined,
    },
    select: {
      // Required by ProposalPayload type
      // contract: true,
      proposal_id: true,
      proposer: true,
      description: true,
      // ordinal: true,
      created_block: true,
      start_block: true,
      end_block: true,
      cancelled_block: true,
      executed_block: true,
      queued_block: true,
      proposal_data: true,
      // proposal_data_raw: true,
      proposal_results: true,
      proposal_type: true,
      // proposal_type_data: true,
      // created_transaction_hash: true,
      // cancelled_transaction_hash: true,
      // executed_transaction_hash: true,
      // queued_transaction_hash: true

      // Required by UI components
      // id: true,
      // markdowntitle: true,
      //status: true,
      //startTime: true,
      //endTime: true,
      //cancelledTime: true,
      //executedTime: true,
      // queuedTime: true
    }
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismProposals.findMany(condition);
    case TENANT_NAMESPACES.ENS:
      return prisma.ensProposals.findMany(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiProposals.findMany(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapProposals.findMany(condition);
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberProposals.findMany(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollProposals.findMany(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveProposals.findMany(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildProposals.findMany(condition);
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostProposals.findMany(condition);
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiProposals.findMany(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3Proposals.findMany(condition);
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoProposals.findMany(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findProposal({
  namespace,
  proposalId,
  contract,
}: {
  namespace: TenantNamespace;
  proposalId: string;
  contract: string;
}) {
  const condition = {
    where: { proposal_id: proposalId, contract },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismProposals.findFirst(condition);
    case TENANT_NAMESPACES.ENS:
      return prisma.ensProposals.findFirst(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiProposals.findFirst(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapProposals.findFirst(condition);
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberProposals.findFirst(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollProposals.findFirst(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveProposals.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildProposals.findFirst(condition);
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostProposals.findFirst(condition);
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiProposals.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3Proposals.findFirst(condition);
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoProposals.findFirst(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findProposalType({
  namespace,
  contract,
}: {
  namespace: TenantNamespace;
  contract: string;
}) {
  const condition = {
    where: {
      contract,
      name: {
        not: "",
      },
    },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.ENS:
      return prisma.ensProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3ProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoProposalTypes.findMany(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findVotes({
  namespace,
  proposalId,
  voter,
}: {
  namespace: TenantNamespace;
  proposalId: string;
  voter: string;
}) {
  const condition = {
    where: { proposal_id: proposalId, voter },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismVotes.findMany(condition);
    case TENANT_NAMESPACES.ENS:
      return prisma.ensVotes.findMany(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiVotes.findMany(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapVotes.findMany(condition);
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberVotes.findMany(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollVotes.findMany(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveVotes.findMany(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildVotes.findMany(condition);
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostVotes.findMany(condition);
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiVotes.findMany(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3Votes.findMany(condition);
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoVotes.findMany(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findVotingPower({
  namespace,
  address,
  contract,
}: {
  namespace: TenantNamespace;
  address: string;
  contract: string;
}) {
  const condition = {
    where: {
      delegate: address,
      contract,
    },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.ENS:
      return prisma.ensVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3VotingPower.findFirst(condition);
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoVotingPower.findFirst(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findAdvancedVotingPower({
  namespace,
  address,
  contract,
}: {
  namespace: TenantNamespace;
  address: string;
  contract: string;
}) {
  const condition = {
    where: {
      delegate: address,
      contract,
    },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.ENS:
      return prisma.ensAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3AdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoAdvancedVotingPower.findFirst(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export async function findStakedDeposit({
  namespace,
  depositId,
}: {
  namespace: TenantNamespace;
  depositId: number;
}) {
  const condition = {
    where: {
      deposit_id: depositId,
    },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.ENS:
      return prisma.ensStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3StakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoStakedDeposits.findFirst(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findStakedDeposits({
  namespace,
  address,
}: {
  namespace: TenantNamespace;
  address: string;
}) {
  const condition = {
    where: {
      depositor: address,
      amount: {
        gt: 0,
      },
    },
    orderBy: {
      deposit_id: "desc" as const,
    },
    select: {
      deposit_id: true,
      depositor: true,
      amount: true,
      delegatee: true,
    },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.ENS:
      return prisma.ensStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3StakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoStakedDeposits.findMany(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function getProposalsCount({
  namespace,
  contract,
}: {
  namespace: TenantNamespace;
  contract: string;
}) {
  const condition = {
    where: {
      contract,
      cancelled_block: null,
    },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prisma.optimismProposals.count(condition);
    case TENANT_NAMESPACES.ENS:
      return prisma.ensProposals.count(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiProposals.count(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapProposals.count(condition);
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberProposals.count(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollProposals.count(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveProposals.count(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildProposals.count(condition);
    case TENANT_NAMESPACES.BOOST:
      return prisma.boostProposals.count(condition);
    case TENANT_NAMESPACES.XAI:
      return prisma.xaiProposals.count(condition);
    case TENANT_NAMESPACES.B3:
      return prisma.b3Proposals.count(condition);
    case TENANT_NAMESPACES.DEMO:
      return prisma.demoProposals.count(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}
