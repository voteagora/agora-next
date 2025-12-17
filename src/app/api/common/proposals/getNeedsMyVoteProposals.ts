import { parseProposal } from "@/lib/proposalUtils";
import { cache } from "react";
import { prismaWeb3Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { ProposalPayload } from "./proposal";
import { fetchVotableSupply } from "../votableSupply/getVotableSupply";
import { fetchQuorumForProposal } from "../quorum/getQuorum";
import { Block } from "ethers";
import { withMetrics } from "@/lib/metricWrapper";
import { fetchOffchainProposalsMap } from "./fetchOffchainProposalsMap";

async function getNeedsMyVoteProposals(address: string) {
  return withMetrics("getNeedsMyVoteProposals", async () => {
    const { namespace, contracts, ui } = Tenant.current();

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
