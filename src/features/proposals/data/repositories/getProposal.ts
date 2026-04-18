import { fetchProposalTaxFormMetadata } from "@/app/api/common/proposals/getProposalTaxFormMetadata";
import { Proposal, ProposalPayload } from "@/app/api/common/proposals/proposal";
import { fetchQuorumForProposal } from "@/app/api/common/quorum/getQuorum";
import { fetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { isOffchainLegacyProposalType } from "@/features/proposals/domain";
import { findOffchainProposal, findProposal } from "@/lib/prismaUtils";
import {
  getStartBlock,
  getStartTimestamp,
  isTimestampBasedProposal,
  parseProposal,
} from "@/lib/proposalUtils";
import {
  getLatestBlockPromise,
  getOffchainParentId,
  getProposalTypeValue,
  ProposalRepositoryContext,
} from "./shared";

type GetProposalDataInput = ProposalRepositoryContext & {
  proposalId: string;
};

export async function getProposalData({
  proposalId,
  namespace,
  contracts,
  ui,
}: GetProposalDataInput): Promise<Proposal | null> {
  const latestBlockPromise = getLatestBlockPromise(ui, contracts);
  const isTimeStampBasedTenant = ui.toggle(
    "use-timestamp-for-proposals"
  )?.enabled;

  const [proposal, offchainProposal, votableSupply, taxFormMetadata] =
    await Promise.all([
      findProposal({
        namespace,
        proposalId,
        contract: contracts.governor.address,
      }),
      findOffchainProposal({
        namespace,
        onchainProposalId: proposalId,
      }),
      fetchVotableSupply(),
      fetchProposalTaxFormMetadata(proposalId),
    ]);

  if (!proposal) {
    return null;
  }

  let baseProposal = proposal as ProposalPayload;
  let resolvedOffchainProposal = offchainProposal as
    | ProposalPayload
    | undefined;

  const proposalType = getProposalTypeValue(proposal as ProposalPayload);
  const onchainId = getOffchainParentId(proposal as ProposalPayload);

  if (proposalType && isOffchainLegacyProposalType(proposalType) && onchainId) {
    const onchainProposal = await findProposal({
      namespace,
      proposalId: onchainId,
      contract: contracts.governor.address,
    });

    if (onchainProposal) {
      baseProposal = onchainProposal as ProposalPayload;
      resolvedOffchainProposal = proposal as ProposalPayload;
    }
  }

  const latestBlock = await latestBlockPromise;

  const isPending =
    (isTimeStampBasedTenant
      ? !isTimestampBasedProposal(baseProposal) ||
        Number(getStartTimestamp(baseProposal)) > latestBlock.timestamp
      : Number(getStartBlock(baseProposal)) > latestBlock.number) ||
    !latestBlock;

  const quorum = isPending ? null : await fetchQuorumForProposal(baseProposal);

  const parsed = await parseProposal(
    baseProposal,
    latestBlock,
    quorum ?? null,
    BigInt(votableSupply),
    resolvedOffchainProposal
  );

  return {
    ...parsed,
    taxFormMetadata,
  };
}
