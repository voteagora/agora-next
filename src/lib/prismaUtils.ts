import prisma from "@/app/lib/prisma";
import { TENANT_NAMESPACES } from "./constants";

export function findDelagatee({
  namespace,
  address,
  contract,
}: {
  namespace: string;
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
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findAdvancedDelegatee({
  namespace,
  address,
  contract,
  partial,
}: {
  namespace: string;
  address: string;
  contract?: string;
  partial?: boolean;
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
      return prisma.optimismAdvancedDelegatees.findMany(
        partial ? undefined : condition
      );
    case TENANT_NAMESPACES.ENS:
      return prisma.ensAdvancedDelegatees.findMany(
        partial ? undefined : condition
      );
    case TENANT_NAMESPACES.ETHERFI:
      return prisma.etherfiAdvancedDelegatees.findMany(
        partial ? undefined : condition
      );
    case TENANT_NAMESPACES.UNISWAP:
      return prisma.uniswapAdvancedDelegatees.findMany(
        partial ? undefined : condition
      );
    case TENANT_NAMESPACES.CYBER:
      return prisma.cyberAdvancedDelegatees.findMany(
        partial ? undefined : condition
      );
    case TENANT_NAMESPACES.SCROLL:
      return prisma.scrollAdvancedDelegatees.findMany(
        partial ? undefined : condition
      );
    case TENANT_NAMESPACES.DERIVE:
      return prisma.deriveAdvancedDelegatees.findMany(
        partial ? undefined : condition
      );
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildAdvancedDelegatees.findMany(
        partial ? undefined : condition
      );
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findVotableSupply({ namespace }: { namespace: string }) {
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
      return prisma.deriveVotableSupply.findFirst({});
    case TENANT_NAMESPACES.PGUILD:
      return prisma.pguildVotableSupply.findFirst({});
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
  namespace: string;
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
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findProposal({
  namespace,
  proposalId,
  contract,
}: {
  namespace: string;
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
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findProposalType({
  namespace,
  contract,
}: {
  namespace: string;
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
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findVotes({
  namespace,
  proposalId,
  voter,
}: {
  namespace: string;
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
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findVotingPower({
  namespace,
  address,
  contract,
}: {
  namespace: string;
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
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findAdvancedVotingPower({
  namespace,
  address,
  contract,
}: {
  namespace: string;
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
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export async function findStakedDeposit({
  namespace,
  depositId,
}: {
  namespace: string;
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
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}

export function findStakedDeposits({
  namespace,
  address,
}: {
  namespace: string;
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
    default:
      throw new Error(`Unknown namespace: ${namespace}`);
  }
}
