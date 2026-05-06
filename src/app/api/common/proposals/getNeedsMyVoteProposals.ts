import { cache } from "react";
import { Block } from "ethers";
import { prismaWeb3Client } from "@/app/lib/prisma";
import { parseProposal } from "@/lib/proposalUtils";
import { proposalsFilterOptions } from "@/lib/constants";
import {
  fetchProposalsFromArchive,
  fetchRawProposalVotesFromArchive,
} from "@/lib/archiveUtils";
import { archiveToProposal } from "@/lib/proposals";
import { withMetrics } from "@/lib/metricWrapper";
import Tenant from "@/lib/tenant/tenant";
import {
  ArchiveListProposal,
  deriveProposalType,
} from "@/lib/types/archiveProposal";
import { fetchOffchainProposalsMap } from "./fetchOffchainProposalsMap";
import { fetchQuorumForProposal } from "../quorum/getQuorum";
import { fetchVotableSupply } from "../votableSupply/getVotableSupply";
import { Proposal, ProposalPayload } from "./proposal";

async function getNeedsMyVoteProposalsFromArchive(address: string) {
  const { namespace, contracts, ui, token } = Tenant.current();

  const isTimeStampBasedTenant = ui.toggle(
    "use-timestamp-for-proposals"
  )?.enabled;

  const latestBlockPromise: Promise<Block> = ui.toggle("use-l1-block-number")
    ?.enabled
    ? contracts.providerForTime?.getBlock("latest")
    : contracts.token.provider.getBlock("latest");

  const [archiveResult, latestBlock] = await Promise.all([
    fetchProposalsFromArchive(
      namespace,
      proposalsFilterOptions.everything.filter
    ),
    latestBlockPromise,
  ]);

  if (!latestBlock) {
    throw new Error("Could not get latest block");
  }

  const nowValue = isTimeStampBasedTenant
    ? latestBlock.timestamp
    : latestBlock.number;
  const nowNum = Number(nowValue);

  const activeCandidates = archiveResult.data.filter((raw) => {
    const p = raw as ArchiveListProposal;
    if (p.cancel_event || p.delete_event || p.lifecycle_stage === "CANCELLED") {
      return false;
    }
    const proposalType = deriveProposalType(p);
    if (proposalType.startsWith("OFFCHAIN")) {
      return false;
    }
    if (isTimeStampBasedTenant) {
      return (
        Number(p.start_blocktime) < nowNum && Number(p.end_blocktime) > nowNum
      );
    }
    return Number(p.start_block) < nowNum && Number(p.end_block) > nowNum;
  });

  activeCandidates.sort((a, b) => {
    const aKey = Number(a.start_blocktime) || Number(a.start_block) || 0;
    const bKey = Number(b.start_blocktime) || Number(b.start_block) || 0;
    return bKey - aKey;
  });

  if (activeCandidates.length === 0) {
    return { proposals: [] as Proposal[] };
  }

  const addrLower = address.toLowerCase();

  const withVoteStatus = await Promise.all(
    activeCandidates.map(async (p) => {
      const votes = await fetchRawProposalVotesFromArchive({
        namespace,
        proposalId: String(p.id),
      });
      const userVoted = votes.some((v) => v.voter?.toLowerCase() === addrLower);
      return { proposal: p, userVoted };
    })
  );

  const needsVote = withVoteStatus
    .filter((x) => !x.userVoted)
    .map((x) => x.proposal);

  const tokenDecimals = token.decimals ?? 18;

  const proposals = await Promise.all(
    needsVote.map((archiveProposal) =>
      archiveToProposal(archiveProposal as ArchiveListProposal, {
        namespace,
        tokenDecimals,
      })
    )
  );

  return { proposals };
}

async function getNeedsMyVoteProposals(address: string) {
  return withMetrics("getNeedsMyVoteProposals", async () => {
    const { namespace, contracts, ui } = Tenant.current();

    if (ui.toggle("use-archive-for-proposals")?.enabled) {
      return getNeedsMyVoteProposalsFromArchive(address);
    }

    const isTimeStampBasedTenant = ui.toggle(
      "use-timestamp-for-proposals"
    )?.enabled;

    const latestBlockPromise: Promise<Block> = ui.toggle("use-l1-block-number")
      ?.enabled
      ? contracts.providerForTime?.getBlock("latest")
      : contracts.token.provider.getBlock("latest");

    const [latestBlock, votableSupply] = await Promise.all([
      latestBlockPromise,
      fetchVotableSupply(),
    ]);

    if (!latestBlock) {
      throw new Error("Could not get latest block");
    }

    const isProdEnv = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
    const prodDataOnly = isProdEnv ? `AND contract = $3` : "";

    const query = `
        SELECT p.*
        FROM (
          SELECT *
          FROM ${namespace + ".proposals_v2"}
          WHERE ${
            isTimeStampBasedTenant
              ? `CAST(start_timestamp AS INTEGER) < $1
                 AND CAST(end_timestamp AS INTEGER) > $1`
              : `CAST(start_block AS INTEGER) < $1
                 AND CAST(end_block AS INTEGER) > $1`
          }
            AND cancelled_block IS NULL
            AND proposal_type NOT LIKE '%OFFCHAIN%'
            ${prodDataOnly}
        ) AS p
        LEFT JOIN ${
          namespace + ".votes"
        } v ON p.proposal_id = v.proposal_id AND v.voter = $2
        WHERE v.proposal_id IS NULL
        ORDER BY p.ordinal DESC;
        `;

    const params: (string | number)[] = [
      isTimeStampBasedTenant ? latestBlock.timestamp : latestBlock.number,
      address.toLowerCase(),
    ];

    if (isProdEnv) {
      params.push(contracts.governor.address.toLowerCase());
    }

    const proposals = await prismaWeb3Client.$queryRawUnsafe<ProposalPayload[]>(
      query,
      ...params
    );

    // Collect IDs of all non-offchain proposals (onchain and hybrid)
    const nonOffchainProposalIds = proposals.map(
      (proposal: ProposalPayload) => proposal.proposal_id
    );

    // Fetch offchain proposals that match our non-offchain proposal IDs
    const offchainProposalsMap = await fetchOffchainProposalsMap({
      namespace,
      proposalIds: nonOffchainProposalIds,
    });

    const resolvedProposals = Promise.all(
      proposals.map(async (proposal) => {
        const quorum = await fetchQuorumForProposal(proposal);

        // Get offchain proposal from map
        const offchainProposal =
          offchainProposalsMap.get(proposal.proposal_id) || null;

        return parseProposal(
          proposal,
          latestBlock,
          quorum ?? null,
          BigInt(votableSupply),
          offchainProposal as ProposalPayload
        );
      })
    );

    return {
      proposals: await resolvedProposals,
    };
  });
}

export const fetchNeedsMyVoteProposals = cache(getNeedsMyVoteProposals);
