import { prismaWeb3Client } from "@/app/lib/prisma";
import { getDelegateVotingPowerFromDaoNode } from "@/app/lib/dao-node/client";
import { cache } from "react";
import {
  getProxyAddress,
  getTotalVotableAllowance,
} from "@/lib/alligatorUtils";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { VotingPowerData, VotingPowerSnapsPayload } from "./votingPower";
import { AuhtorityChainsAggregate } from "../authority-chains/authorityChains";
import Tenant from "@/lib/tenant/tenant";
import {
  findAdvancedVotingPower,
  findDelagatee,
  findVotingPower,
} from "@/lib/prismaUtils";
import { withMetrics } from "@/lib/metricWrapper";

/**
 * Voting Power for a given block
 * @param addressOrENSName
 * @param blockNumber
 * @param proposalId
 */
const getVotingPowerForProposal = ({
  addressOrENSName,
  blockNumber,
  proposalId,
}: {
  addressOrENSName: string;
  blockNumber: number;
  proposalId: string;
}) =>
  addressOrEnsNameWrap(getVotingPowerForProposalByAddress, addressOrENSName, {
    blockNumber,
    proposalId,
  });

async function getVotingPowerForProposalByAddress({
  address,
  blockNumber,
  proposalId,
}: {
  address: string;
  blockNumber: number;
  proposalId: string;
}): Promise<VotingPowerData> {
  return withMetrics("getVotingPowerForProposalByAddress", async () => {
    const { namespace, contracts } = Tenant.current();
    const votingPowerQuery = prismaWeb3Client.$queryRawUnsafe<
      VotingPowerSnapsPayload[]
    >(
      `
        SELECT
          *
        FROM ${namespace + ".voting_power_snaps"}
        WHERE delegate = $1
          AND block_number <= $2
          AND contract = $3
        ORDER BY block_number DESC, transaction_index DESC, log_index DESC
        LIMIT 1;
        `,
      address,
      blockNumber,
      contracts.token.address
    );

    // This query pulls only partially delegated voting power
    const advancedVotingPowerQuery = prismaWeb3Client.$queryRawUnsafe<
      AuhtorityChainsAggregate[]
    >(
      `
        SELECT 
          array_agg(proxy) as proxies,
          array_agg(balance) as balances,
          json_agg(rules) as rules,
          json_agg(chain) as chains,
          SUM(COALESCE(subdelegated_share,0)) as subdelegated_share,
          SUM(COALESCE(subdelegated_amount,0)) as subdelegated_amount
        FROM (
          SELECT
            a.delegate,
            rules,
            chain,
            allowance,
            subdelegated_share,
            subdelegated_amount,
            balance,
            proxy
          FROM (
            SELECT chain_str
            FROM ${namespace + ".advanced_voting_power_raw_snaps"}
            WHERE contract = $2
              AND block_number <= $3
              AND delegate = $1
            GROUP BY chain_str
          )s
          LEFT JOIN LATERAL (
            SELECT
              delegate,
              rules,
              chain,
              allowance,
              subdelegated_share,
              subdelegated_amount,
              balance,
              proxy,
              block_number
            FROM ${namespace + ".advanced_voting_power_raw_snaps"}
            WHERE chain_str=s.chain_str 
              AND contract = $2
              AND block_number <= $3
            ORDER BY ordinal DESC
            LIMIT 1
          ) AS a ON TRUE
        ) t
        WHERE allowance > 0;
        `,
      address,
      contracts.alligator?.address,
      blockNumber
    );

    const [votingPower, advancedVotingPower] = await Promise.all([
      votingPowerQuery,
      advancedVotingPowerQuery,
    ]);

    const advancedVP = await getTotalVotableAllowance({
      ...advancedVotingPower[0],
      proposalId,
    });

    return {
      directVP: votingPower[0]?.balance ?? "0",
      advancedVP: advancedVP.toString(),
      totalVP: (BigInt(votingPower[0]?.balance ?? "0") + advancedVP).toString(),
    };
  });
}

/**
 * Voting Power
 * @param addressOrENSName
 */
const getCurrentVotingPowerForNamespace = (addressOrENSName: string) =>
  addressOrEnsNameWrap(getCurrentVotingPowerForAddress, addressOrENSName);

async function getCurrentVotingPowerForAddress({
  address,
}: {
  address: string;
}): Promise<VotingPowerData> {
  return withMetrics("getCurrentVotingPowerForAddress", async () => {
    const { namespace, contracts, ui } = Tenant.current();
    const includeL3Staking = ui.toggle("include-nonivotes")?.enabled ?? false;

    const daoNodeVotingPowerPromise = includeL3Staking
      ? getDelegateVotingPowerFromDaoNode(address)
      : Promise.resolve<string | null>(null);

    const [votingPower, advancedVotingPower, daoNodeVotingPower] =
      await Promise.all([
        findVotingPower({
          namespace,
          address,
          contract: contracts.token.address,
        }),
        findAdvancedVotingPower({
          namespace,
          address,
          contract: contracts.alligator!.address,
        }),
        daoNodeVotingPowerPromise,
      ]);

    const fallbackDirectVotingPower = votingPower?.voting_power ?? "0";
    const fallbackAdvancedVotingPower =
      advancedVotingPower?.advanced_vp.toFixed(0) ?? "0";

    const directVP = daoNodeVotingPower ?? fallbackDirectVotingPower;
    const advancedVP = daoNodeVotingPower ? "0" : fallbackAdvancedVotingPower;
    const totalVP = daoNodeVotingPower
      ? daoNodeVotingPower
      : (
          BigInt(fallbackDirectVotingPower) +
          BigInt(fallbackAdvancedVotingPower)
        ).toString();

    return {
      directVP,
      advancedVP,
      totalVP,
    };
  });
}

/**
 *  Voting Power available for subdelegation
 * @param addressOrENSName
 */
const getVotingPowerAvailableForSubdelegation = (addressOrENSName: string) =>
  addressOrEnsNameWrap(
    getVotingPowerAvailableForSubdelegationForAddress,
    addressOrENSName
  );

async function getVotingPowerAvailableForSubdelegationForAddress({
  address,
}: {
  address: string;
}): Promise<string> {
  return withMetrics(
    "getVotingPowerAvailableForSubdelegationForAddress",
    async () => {
      const { namespace, contracts } = Tenant.current();
      const advancedVotingPower = await findAdvancedVotingPower({
        namespace,
        address,
        contract: contracts.alligator!.address,
      });

      const undelegatedVotingPower = (async () => {
        const [isBalanceAccountedFor, balance] = await Promise.all([
          isAddressDelegatingToProxy({ address }),
          contracts.token.contract.balanceOf(address),
        ]);
        return isBalanceAccountedFor ? 0n : balance;
      })();

      return (
        BigInt(
          advancedVotingPower?.vp_delegatable_allowance.toFixed(0) ?? "0"
        ) + (await undelegatedVotingPower)
      ).toString();
    }
  );
}

/**
 * Voting Power available for direct delegation:
 * Represents the balance of the user's account
 * @param addressOrENSName
 */
const getVotingPowerAvailableForDirectDelegation = (addressOrENSName: string) =>
  addressOrEnsNameWrap(
    getVotingPowerAvailableForDirectDelegationForAddress,
    addressOrENSName
  );

async function getVotingPowerAvailableForDirectDelegationForAddress({
  address,
}: {
  address: string;
}): Promise<bigint> {
  return withMetrics(
    "getVotingPowerAvailableForDirectDelegationForAddress",
    async () => {
      const { contracts } = Tenant.current();
      return contracts.token.contract.balanceOf(address);
    }
  );
}

/**
 * Checks if a user has delegated to its proxy
 * @param addressOrENSName
 */
const isDelegatingToProxy = (addressOrENSName: string) =>
  addressOrEnsNameWrap(isAddressDelegatingToProxy, addressOrENSName);

async function isAddressDelegatingToProxy({
  address,
}: {
  address: string;
}): Promise<boolean> {
  return withMetrics("isAddressDelegatingToProxy", async () => {
    const { namespace } = Tenant.current();
    const [proxyAddress, delegatee] = await Promise.all([
      getProxyAddress(address),
      findDelagatee({ namespace, address }),
    ]);

    if (
      proxyAddress &&
      delegatee &&
      delegatee.delegatee === proxyAddress.toLowerCase()
    ) {
      return true;
    }

    return false;
  });
}

/**
 * Gets the proxy address for a given address
 * @param addressOrENSName
 */
const getProxy = (addressOrENSName: string) =>
  addressOrEnsNameWrap(getProxyAddressForAddress, addressOrENSName);

async function getProxyAddressForAddress({
  address,
}: {
  address: string;
}): Promise<string | null> {
  return withMetrics("getProxyAddressForAddress", async () => {
    return getProxyAddress(address);
  });
}

export const fetchVotingPowerForProposal = cache(getVotingPowerForProposal);
export const fetchCurrentVotingPowerForNamespace = cache(
  getCurrentVotingPowerForNamespace
);
export const fetchVotingPowerAvailableForSubdelegation = cache(
  getVotingPowerAvailableForSubdelegation
);
export const fetchVotingPowerAvailableForDirectDelegation = cache(
  getVotingPowerAvailableForDirectDelegation
);
export const fetchIsDelegatingToProxy = cache(isDelegatingToProxy);
export const fetchProxy = cache(getProxy);
