"use server";

import { fetchAllForAdvancedDelegation as apiFetchAllForAdvancedDelegation } from "@/app/api/delegations/getDelegations";
import { type DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { fetchVotesForDelegate as apiFetchVotesForDelegate } from "@/app/api/common/votes/getVotes";
import {
  fetchIsDelegatingToProxy,
  fetchVotingPowerAvailableForDirectDelegation,
  fetchVotingPowerAvailableForSubdelegation,
} from "@/app/api/common/voting-power/getVotingPower";
import {
  fetchDelegate as apiFetchDelegate,
  fetchVoterStats as apiFetchVoterStats,
} from "@/app/api/common/delegates/getDelegates";
import { fetchDelegateStatement as apiFetchDelegateStatement } from "@/app/api/common/delegateStatement/getDelegateStatement";
import {
  fetchAllDelegatorsInChains,
  fetchCurrentDelegatees as apiFetchCurrentDelegatees,
  fetchCurrentDelegators as apiFetchCurrentDelegators,
  fetchDirectDelegatee as apiFetchDirectDelegatee,
} from "@/app/api/common/delegations/getDelegations";
import { createDelegateStatement } from "@/app/api/common/delegateStatement/createDelegateStatement";
import Tenant from "@/lib/tenant/tenant";
import { PaginationParams } from "../lib/pagination";
import { fetchUpdateNotificationPreferencesForAddress } from "@/app/api/common/notifications/updateNotificationPreferencesForAddress";
import { getDelegateDataFromDaoNode } from "@/app/lib/dao-node/client";
import { fetchProposalsFromArchive } from "@/lib/archiveUtils";
import { proposalsFilterOptions } from "@/lib/constants";
import { fetchVotesCountForDelegate } from "@/app/api/common/votes/getVotes";
import { prismaWeb3Client } from "@/app/lib/prisma";

export const fetchDelegate = async (address: string) => {
  try {
    const cachedFetchDelegate = unstable_cache(
      async () => {
        return await apiFetchDelegate(address);
      },
      [`delegate-${address.toLowerCase()}`],
      {
        revalidate: 60, // 1 minute
        tags: [`delegate-${address.toLowerCase()}`],
      }
    );

    return await cachedFetchDelegate();
  } catch (error) {
    console.error("Error fetching delegate data:", error);
    throw error;
  }
};

export const fetchVoterStats = unstable_cache(
  async (address: string, blockNumberOrTimestamp?: number) => {
    return apiFetchVoterStats(address, blockNumberOrTimestamp);
  },
  ["voterStats"],
  {
    // Cache for 10 minutes unless invalidated by the block
    // This cache will get invalidated by the block number update
    revalidate: 600,
    tags: ["voterStats"],
  }
);

export const fetchDelegateStatement = unstable_cache(
  async (address: string) => {
    return apiFetchDelegateStatement(address);
  },
  ["delegateStatement"],
  {
    // Longer cache is acceptable since the statement is not expected to change
    // often and invalidated with every delegate statement update
    revalidate: 600, // 10 minute cache
    tags: ["delegateStatement"],
  }
);

// Pass address of the connected wallet
export async function fetchVotingPowerForSubdelegation(
  addressOrENSName: string
) {
  return fetchVotingPowerAvailableForSubdelegation(addressOrENSName);
}

// Pass address of the connected wallet
export async function checkIfDelegatingToProxy(addressOrENSName: string) {
  return fetchIsDelegatingToProxy(addressOrENSName);
}

// Pass address of the connected wallet
export async function fetchBalanceForDirectDelegation(
  addressOrENSName: string
) {
  return fetchVotingPowerAvailableForDirectDelegation(addressOrENSName);
}

export async function fetchDirectDelegatee(addressOrENSName: string) {
  return apiFetchDirectDelegatee(addressOrENSName);
}

export async function submitDelegateStatement({
  address,
  delegateStatement,
  signature,
  message,
  scwAddress,
}: {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  signature: `0x${string}`;
  message: string;
  scwAddress?: string;
}) {
  const response = await createDelegateStatement({
    address,
    delegateStatement,
    signature,
    message,
    scwAddress,
  });

  revalidateDelegateAddressPage(address.toLowerCase());
  revalidatePath("/delegates/create", "page");
  return response;
}

export async function fetchVotesForDelegate(
  addressOrENSName: string,
  pagination?: {
    offset: number;
    limit: number;
  }
) {
  return apiFetchVotesForDelegate({
    addressOrENSName,
    pagination,
  });
}

// Pass address of the connected wallet
export async function fetchCurrentDelegatees(addressOrENSName: string) {
  return apiFetchCurrentDelegatees(addressOrENSName);
}

export async function fetchCurrentDelegators(
  addressOrENSName: string,
  pagination: PaginationParams = {
    offset: 0,
    limit: 20,
  }
) {
  return apiFetchCurrentDelegators(addressOrENSName, pagination);
}

// TODO temporary fetch all query - optimization via API needed
export async function fetchAllForAdvancedDelegation(address: string) {
  return apiFetchAllForAdvancedDelegation(address);
}

// Pass address of the connected wallet
export async function fetchAllDelegatorsInChainsForAddress(
  addressOrENSName: string
) {
  return fetchAllDelegatorsInChains(addressOrENSName);
}

export async function balanceOf(address: string) {
  const { contracts } = Tenant.current();
  return contracts.token.contract.balanceOf(address);
}

export const fetchConnectedDelegate = async (address: string) => {
  return await Promise.all([
    fetchDelegate(address),
    fetchAllDelegatorsInChainsForAddress(address),
    balanceOf(address),
  ]);
};

export const revalidateDelegateAddressPage = async (
  delegateAddress: string
) => {
  revalidateTag(`delegate-${delegateAddress}`);
  revalidatePath(`/delegates/${delegateAddress}`, "page");
};

export async function updateNotificationPreferencesForAddress(
  address: `0x${string}`,
  email: string,
  options: {
    wants_proposal_created_email: "prompt" | "prompted" | true | false;
    wants_proposal_ending_soon_email: "prompt" | "prompted" | true | false;
  }
) {
  return fetchUpdateNotificationPreferencesForAddress(address, email, options);
}

export const fetchDelegateStats = async (address: string) => {
  return getDelegateDataFromDaoNode(address);
};

// Archive-based participation rate for tenants using archive-backed proposals
export const fetchArchiveParticipation = async (address: string) => {
  const { namespace, ui } = Tenant.current();
  const useArchive = ui.toggle("use-archive-for-proposals")?.enabled ?? false;

  if (!useArchive) {
    return null;
  }

  // Pull archive proposals then consider only the 10 most recent by created_time/created_block_number
  const archiveList = await fetchProposalsFromArchive(
    namespace,
    proposalsFilterOptions.everything.filter
  );

  const proposals = archiveList?.data ?? [];
  const recentProposals = [...proposals]
    // Keep proposals that have a numeric created time (direct or via created_event)
    .filter((p) => {
      const createdTs =
        (p as any).created_time ??
        p.created_event?.timestamp ??
        p.created_event?.blocktime;
      return typeof createdTs === "number" && !Number.isNaN(createdTs);
    })
    // Sort by created_time desc; tie-break by created_block_number desc when available
    .sort((a, b) => {
      const aTime =
        (a as any).created_time ??
        a.created_event?.timestamp ??
        a.created_event?.blocktime ??
        0;
      const bTime =
        (b as any).created_time ??
        b.created_event?.timestamp ??
        b.created_event?.blocktime ??
        0;

      if (bTime !== aTime) {
        return Number(bTime) - Number(aTime);
      }

      const aBlock = Number(
        (a as any).created_block_number ?? a.created_event?.block_number ?? 0
      );
      const bBlock = Number(
        (b as any).created_block_number ?? b.created_event?.block_number ?? 0
      );
      return bBlock - aBlock;
    })
    .slice(0, 10);

  const totalProposals = recentProposals.length;

  if (totalProposals === 0) {
    return { participated: 0, totalProposals: 0, rate: 0 };
  }

  const proposalIds = recentProposals.map((p) => String(p.id));

  // Count proposals among the recent ones that this delegate voted on
  // Using CTE to filter by voter and contract first (most selective), then proposal ID
  const { contracts } = Tenant.current();
  const rows = await prismaWeb3Client.$queryRawUnsafe<
    {
      count: number;
    }[]
  >(
    `
      WITH filtered_votes AS (
        SELECT proposal_id
        FROM ${namespace}.votes
        WHERE voter = $1
          AND contract = $2
        GROUP BY proposal_id
      )
      SELECT COUNT(*)::int AS count
      FROM filtered_votes
      WHERE proposal_id = ANY($3::text[])
    `,
    address.toLowerCase(),
    contracts.governor.address.toLowerCase(),
    proposalIds
  );

  const participated = rows?.[0]?.count ?? 0;
  const rate = totalProposals > 0 ? participated / totalProposals : 0;

  return {
    participated,
    totalProposals,
    rate,
  };
};
