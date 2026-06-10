import { cache } from "react";
import { ProposalPayload } from "../proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { fetchVotableSupplyUnstableCache } from "../votableSupply/getVotableSupply";
import type { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";

type CurrentQuorumFunction = NonNullable<IGovernorContract["quorum"]>;

const CURRENT_QUORUM_MAX_LOOKBACK_BLOCKS = 6;
const RETRIABLE_CURRENT_QUORUM_ERROR_PATTERNS = [
  "block not yet mined",
  "header not found",
  "unknown block",
  "could not find block",
  "cannot find block",
  "block not found",
  "after last accepted block",
  "greater than latest block",
];

function collectErrorMessages(error: unknown): string[] {
  if (typeof error === "string") {
    return [error];
  }

  if (!error || typeof error !== "object") {
    return [];
  }

  const messages: string[] = [];

  if (error instanceof Error) {
    messages.push(error.message);
  }

  const errorRecord = error as Record<string, unknown>;
  for (const key of ["reason", "shortMessage", "message", "code"]) {
    const value = errorRecord[key];
    if (typeof value === "string") {
      messages.push(value);
    }
  }

  for (const key of ["error", "info"]) {
    const nested = errorRecord[key];
    if (nested && nested !== error) {
      messages.push(...collectErrorMessages(nested));
    }
  }

  return messages;
}

export function isRetriableCurrentQuorumError(error: unknown) {
  const message = collectErrorMessages(error).join(" ").toLowerCase();
  return RETRIABLE_CURRENT_QUORUM_ERROR_PATTERNS.some((pattern) =>
    message.includes(pattern)
  );
}

export async function getCurrentQuorumWithRetries(
  quorum: CurrentQuorumFunction,
  latestBlockNumber: number
) {
  let lastError: unknown;

  for (let lag = 1; lag <= CURRENT_QUORUM_MAX_LOOKBACK_BLOCKS; lag++) {
    const quorumBlockNumber = latestBlockNumber - lag;

    if (quorumBlockNumber < 0) {
      break;
    }

    try {
      return await quorum(quorumBlockNumber, {
        blockTag: quorumBlockNumber + 1,
      });
    } catch (error) {
      if (!isRetriableCurrentQuorumError(error)) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError;
}

async function getQuorumForProposal(proposal: ProposalPayload) {
  const { namespace, contracts } = Tenant.current();

  var votableSupply;
  var quorum;

  switch (namespace) {
    case TENANT_NAMESPACES.ENS:
      if (proposal.created_block) {
        return await contracts.governor.contract.quorum!(
          proposal.created_block
        );
      } else {
        return null;
      }

    case TENANT_NAMESPACES.UNISWAP:
      return await contracts.governor.contract.quorumVotes!();

    case TENANT_NAMESPACES.OPTIMISM:
      if (
        contracts.governor.v6UpgradeBlock &&
        proposal.created_block &&
        proposal.created_block < contracts.governor.v6UpgradeBlock
      ) {
        return 0n;
      }

      quorum = await contracts.governor.contract.quorum!(proposal.proposal_id);

      // If no quorum is set, calculate it based on votable supply
      if (!quorum) {
        votableSupply = await fetchVotableSupplyUnstableCache();
        return (BigInt(Number(votableSupply)) * 30n) / 100n;
      }
      return quorum;

    case TENANT_NAMESPACES.CYBER:
      // Why is the cyber implementation hardcoded to 30%? Rather than checking based on every proposal?

      // Because...
      // https://voteagora.slack.com/archives/C07ATDL9P8F/p1723657375357649?thread_ts=1723579392.179389&cid=C07ATDL9P8F
      // https://voteagora.slack.com/archives/C07ATDL9P8F/p1723657834565499

      votableSupply = await fetchVotableSupplyUnstableCache();
      return (BigInt(Number(votableSupply)) * 30n) / 100n;

    case TENANT_NAMESPACES.SCROLL:
      if (contracts.token.isERC20()) {
        let totalSupply = await contracts.token.contract.totalSupply();

        const proposalTypeData = proposal?.proposal_type_data as {
          quorum: number;
        };

        quorum =
          (totalSupply * BigInt(proposalTypeData.quorum) * 100000n) /
          1000000000n;
      }

      return BigInt(Number(quorum));

    default:
      try {
        quorum = await contracts.governor.contract.quorum!(
          proposal.proposal_id
        );
      } catch {
        // this is a hack, because...git // https://linear.app/agora-app/issue/AGORA-3246/quorum-isnt-known-for-proposal-before-its-snapshot
        quorum = await fetchVotableSupplyUnstableCache();
      }
      return BigInt(Number(quorum));
  }
}

/*
  Retrieve the current quorum based on block number
*/
async function getCurrentQuorum() {
  const { namespace, contracts } = Tenant.current();

  switch (namespace) {
    case TENANT_NAMESPACES.UNISWAP:
      return contracts.governor.contract.quorumVotes!();

    case TENANT_NAMESPACES.ENS:
    case TENANT_NAMESPACES.OPTIMISM: {
      const latestBlockNumber = await contracts.token.provider.getBlockNumber();
      if (!latestBlockNumber) {
        return null;
      }
      return getCurrentQuorumWithRetries(
        contracts.governor.contract.quorum!,
        latestBlockNumber
      );
    }
  }
}

/*
  Gets and caches the quorum for the supplied proposal
*/
export const fetchQuorumForProposal = cache(getQuorumForProposal);

/*
  Gets and caches quorum based on current block number
*/
export const fetchCurrentQuorum = cache(getCurrentQuorum);
