import prisma from "@/app/lib/prisma";
import { getProxyAddress } from "@/lib/alligatorUtils";
import { contracts } from "@/lib/contracts/contracts";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { AdvancedVotingPowerPayload, VotingPowerData } from "./votingPower";

/**
 * Voting Power at a given block number
 * @param address
 * @param blockNumber
 * @param namespace
 * @returns VotingPowerData
 */
export const getVotingPowerAtSnapshotForNamespace = ({
  addressOrENSName,
  blockNumber,
  namespace,
}: {
  addressOrENSName: string;
  blockNumber: number;
  namespace: "optimism";
}) =>
  addressOrEnsNameWrap(getVotingPowerAtSnapshotByAddress, addressOrENSName, {
    blockNumber,
    namespace,
  });

async function getVotingPowerAtSnapshotByAddress({
  address,
  blockNumber,
  namespace,
}: {
  address: string;
  blockNumber: number;
  namespace: "optimism";
}): Promise<VotingPowerData> {
  const votingPowerQuery = prisma[`${namespace}VotingPowerSnaps`].findFirst({
    where: {
      delegate: address,
      block_number: {
        lte: blockNumber,
      },
    },
    orderBy: {
      ordinal: "desc",
    },
  });

  // This query pulls only partially delegated voting power
  const advancedVotingPowerQuery = prisma.$queryRawUnsafe<
    AdvancedVotingPowerPayload[]
  >(
    `
    SELECT
      delegate,
      vp_allowance,
      vp_allowance * COALESCE(subdelegated_share, 0) as delegated_vp,
        vp_allowance * (1 - COALESCE(subdelegated_share, 0)) as advanced_vp
    FROM (
        SELECT
            a.delegate,
            subdelegated_share,
            SUM(allowance) as vp_allowance
        FROM (
            SELECT chain_str
            FROM ${namespace + ".advanced_voting_power_raw_snaps"}
            WHERE contract = $2
              AND block_number <= $3
              AND delegate = $1
            GROUP BY chain_str
        ) s
        LEFT JOIN LATERAL (
            SELECT
                delegate,
                allowance,
                subdelegated_share,
                block_number
            FROM ${namespace + ".advanced_voting_power_raw_snaps"}
            WHERE chain_str=s.chain_str 
              AND contract = $2
              AND block_number <= $3
            ORDER BY block_number DESC
            LIMIT 1
        ) AS a ON TRUE
        GROUP BY 1, 2
    ) t
    WHERE delegate = $1;
    `,
    address,
    contracts(namespace).alligator.address.toLowerCase(), // TODO: update based on namespace
    blockNumber
  );

  const [votingPower, advancedVotingPower] = await Promise.all([
    votingPowerQuery,
    advancedVotingPowerQuery,
  ]);

  return {
    directVP: votingPower?.balance ?? "0",
    advancedVP: advancedVotingPower[0]?.advanced_vp.toFixed(0) ?? "0",
    totalVP: (
      BigInt(votingPower?.balance ?? "0") +
      BigInt(advancedVotingPower[0]?.advanced_vp.toFixed(0) ?? "0")
    ).toString(),
  };
}

/**
 * Voting Power
 * @param address
 * @param namespace
 * @returns VotingPowerData
 */
export const getCurrentVotingPowerForNamespace = ({
  addressOrENSName,
  namespace,
}: {
  addressOrENSName: string;
  namespace: "optimism";
}) =>
  addressOrEnsNameWrap(getCurrentVotingPowerForAddress, addressOrENSName, {
    namespace,
  });

async function getCurrentVotingPowerForAddress({
  address,
  namespace,
}: {
  address: string;
  namespace: "optimism";
}): Promise<VotingPowerData> {
  const votingPower = await prisma[`${namespace}VotingPower`].findFirst({
    where: {
      delegate: address,
    },
  });

  // This query pulls only partially delegated voting power
  const advancedVotingPower = await prisma[
    `${namespace}AdvancedVotingPower`
  ].findFirst({
    where: {
      delegate: address,
      contract: contracts(namespace).alligator.address.toLowerCase(),
    },
  });

  return {
    directVP: votingPower?.voting_power ?? "0",
    advancedVP: advancedVotingPower?.advanced_vp.toFixed(0) ?? "0",
    totalVP: (
      BigInt(votingPower?.voting_power ?? "0") +
      BigInt(advancedVotingPower?.advanced_vp.toFixed(0) ?? "0")
    ).toString(),
  };
}

/**
 * Voting Power available for subdelegation
 * Includes subdelegated balances & undelegated balance
 * @param address
 * @param namespace
 * @returns {votingPower}
 */
export const getVotingPowerAvailableForSubdelegationForNamespace = ({
  addressOrENSName,
  namespace,
}: {
  addressOrENSName: string;
  namespace: "optimism";
}) =>
  addressOrEnsNameWrap(
    getVotingPowerAvailableForSubdelegationForAddress,
    addressOrENSName,
    { namespace }
  );

async function getVotingPowerAvailableForSubdelegationForAddress({
  address,
  namespace,
}: {
  address: string;
  namespace: "optimism";
}): Promise<string> {
  const advancedVotingPower = await prisma[
    `${namespace}AdvancedVotingPower`
  ].findFirst({
    where: {
      delegate: address,
      contract: contracts(namespace).alligator.address.toLowerCase(),
    },
  });

  const undelegatedVotingPower = (async () => {
    const [isBalanceAccountedFor, balance] = await Promise.all([
      isAddressDelegatingToProxy({ address, namespace }),
      contracts(namespace).token.contract.balanceOf(address),
    ]);
    return isBalanceAccountedFor ? 0n : balance;
  })();

  return (
    BigInt(advancedVotingPower?.vp_allowance.toFixed(0) ?? "0") +
    (await undelegatedVotingPower)
  ).toString();
}

/**
 * Voting Power available for direct delegation:
 * Represents the balance of the user's account
 * @param address
 * @param namespace
 * @returns {votingPower}
 */
export const getVotingPowerAvailableForDirectDelegationForNamespace = ({
  addressOrENSName,
  namespace,
}: {
  addressOrENSName: string;
  namespace: "optimism";
}) =>
  addressOrEnsNameWrap(
    getVotingPowerAvailableForDirectDelegationForAddress,
    addressOrENSName,
    { namespace }
  );

async function getVotingPowerAvailableForDirectDelegationForAddress({
  address,
  namespace,
}: {
  address: string;
  namespace: "optimism";
}): Promise<bigint> {
  return contracts(namespace).token.contract.balanceOf(address); // TODO: update based on namespace
}

/**
 * Checks if a user has delegated to its proxy
 * @param address
 * @param namespace
 * @returns {boolean}
 */
export const isDelegatingToProxyForNamespace = ({
  addressOrENSName,
  namespace,
}: {
  addressOrENSName: string;
  namespace: "optimism";
}) =>
  addressOrEnsNameWrap(isAddressDelegatingToProxy, addressOrENSName, {
    namespace,
  });

async function isAddressDelegatingToProxy({
  address,
  namespace,
}: {
  address: string;
  namespace: "optimism";
}): Promise<boolean> {
  const [proxyAddress, delegatee] = await Promise.all([
    getProxyAddress(address, namespace),
    prisma[`${namespace}Delegatees`].findFirst({
      where: { delegator: address.toLowerCase() },
    }),
  ]);

  if (
    proxyAddress &&
    delegatee &&
    delegatee.delegatee === proxyAddress.toLowerCase()
  ) {
    return true;
  }

  return false;
}

/**
 * Gets the proxy address for a given address
 * @param address
 * @param namespace
 * @returns {string}
 */
export const getProxyForNamespace = ({
  addressOrENSName,
  namespace,
}: {
  addressOrENSName: string;
  namespace: "optimism";
}) =>
  addressOrEnsNameWrap(getProxyAddressForAddress, addressOrENSName, {
    namespace,
  });

async function getProxyAddressForAddress({
  address,
  namespace,
}: {
  address: string;
  namespace: "optimism";
}): Promise<string> {
  return getProxyAddress(address, namespace);
}
