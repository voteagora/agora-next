import { prismaWeb3Client } from "@/app/lib/prisma";
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
      delegatee: {
        not: "0x0000000000000000000000000000000000000000",
      },
    },
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prismaWeb3Client.optimismDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiDelegatees.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3Delegatees.findFirst(condition);
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoDelegatees.findFirst(condition);
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
      return prismaWeb3Client.optimismAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiAdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3AdvancedDelegatees.findMany(condition);
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoAdvancedDelegatees.findMany(condition);
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
      return prismaWeb3Client.optimismVotableSupply.findFirst({});
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensVotableSupply.findFirst({});
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiVotableSupply.findFirst({});
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapVotableSupply.findFirst({});
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberVotableSupply.findFirst({});
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollVotableSupply.findFirst({});
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveVotableSupply.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildVotableSupply.findFirst({});
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostVotableSupply.findFirst({});
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiVotableSupply.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3VotableSupply.findFirst({});
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoVotableSupply.findFirst({});
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findProposalsQuery({
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
  };

  switch (namespace) {
    case TENANT_NAMESPACES.OPTIMISM:
      return prismaWeb3Client.optimismProposals.findMany(condition);
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensProposals.findMany(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiProposals.findMany(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapProposals.findMany(condition);
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberProposals.findMany(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollProposals.findMany(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveProposals.findMany(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildProposals.findMany(condition);
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostProposals.findMany(condition);
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiProposals.findMany(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3Proposals.findMany(condition);
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoProposals.findMany(condition);
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
      return prismaWeb3Client.optimismProposals.findFirst(condition);
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensProposals.findFirst(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiProposals.findFirst(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapProposals.findFirst(condition);
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberProposals.findFirst(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollProposals.findFirst(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveProposals.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildProposals.findFirst(condition);
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostProposals.findFirst(condition);
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiProposals.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3Proposals.findFirst(condition);
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoProposals.findFirst(condition);
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
      return prismaWeb3Client.optimismProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3ProposalTypes.findMany(condition);
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoProposalTypes.findMany(condition);
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
      return prismaWeb3Client.optimismVotes.findMany(condition);
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensVotes.findMany(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiVotes.findMany(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapVotes.findMany(condition);
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberVotes.findMany(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollVotes.findMany(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveVotes.findMany(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildVotes.findMany(condition);
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostVotes.findMany(condition);
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiVotes.findMany(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3Votes.findMany(condition);
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoVotes.findMany(condition);
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
      return prismaWeb3Client.optimismVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3VotingPower.findFirst(condition);
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoVotingPower.findFirst(condition);
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
      return prismaWeb3Client.optimismAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiAdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3AdvancedVotingPower.findFirst(condition);
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoAdvancedVotingPower.findFirst(condition);
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
      return prismaWeb3Client.optimismStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiStakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3StakedDeposits.findFirst(condition);
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoStakedDeposits.findFirst(condition);
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
      return prismaWeb3Client.optimismStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiStakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3StakedDeposits.findMany(condition);
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoStakedDeposits.findMany(condition);
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
      return prismaWeb3Client.optimismProposals.count(condition);
    case TENANT_NAMESPACES.ENS:
      return prismaWeb3Client.ensProposals.count(condition);
    case TENANT_NAMESPACES.ETHERFI:
      return prismaWeb3Client.etherfiProposals.count(condition);
    case TENANT_NAMESPACES.UNISWAP:
      return prismaWeb3Client.uniswapProposals.count(condition);
    case TENANT_NAMESPACES.CYBER:
      return prismaWeb3Client.cyberProposals.count(condition);
    case TENANT_NAMESPACES.SCROLL:
      return prismaWeb3Client.scrollProposals.count(condition);
    case TENANT_NAMESPACES.DERIVE:
      return prismaWeb3Client.deriveProposals.count(condition);
    case TENANT_NAMESPACES.PGUILD:
      return prismaWeb3Client.pguildProposals.count(condition);
    case TENANT_NAMESPACES.BOOST:
      return prismaWeb3Client.boostProposals.count(condition);
    case TENANT_NAMESPACES.XAI:
      return prismaWeb3Client.xaiProposals.count(condition);
    case TENANT_NAMESPACES.B3:
      return prismaWeb3Client.b3Proposals.count(condition);
    case TENANT_NAMESPACES.DEMO:
      return prismaWeb3Client.demoProposals.count(condition);
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}
