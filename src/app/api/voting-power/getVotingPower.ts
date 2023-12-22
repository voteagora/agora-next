import prisma from "@/app/lib/prisma";
import { getProxyAddress } from "@/lib/alligatorUtils";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { Prisma } from "@prisma/client";
import { addressOrEnsNameWrap } from "../utils/ensName";

/**
 * Voting Power at a given block number
 * @param address
 * @param blockNumber
 * @returns {directVP, advancedVP, totalVP}
 */
export const getVotingPowerAtSnapshot = ({
  addressOrENSName,
  blockNumber,
}: {
  addressOrENSName: string;
  blockNumber: number;
}) =>
  addressOrEnsNameWrap(getVotingPowerAtSnapshotByAddress, addressOrENSName, {
    blockNumber,
  });

async function getVotingPowerAtSnapshotByAddress({
  address,
  blockNumber,
}: {
  address: string;
  blockNumber: number;
}): Promise<{ directVP: string; advancedVP: string; totalVP: string }> {
  const votingPower = await prisma.votingPowerSnaps.findFirst({
    where: {
      delegate: address,
      block_number: {
        lte: blockNumber,
      },
    },
    orderBy: {
      block_number: "desc",
    },
  });

  // This query pulls only partially delegated voting power
  const advancedVotingPower = await prisma.$queryRaw<
    Prisma.AdvancedVotingPowerGetPayload<true>[]
  >(
    Prisma.sql`
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
            FROM center.advanced_voting_power_raw_snaps
            GROUP BY chain_str
        ) s
        LEFT JOIN LATERAL (
            SELECT
                delegate,
                allowance,
                subdelegated_share,
                block_number
            FROM center.advanced_voting_power_raw_snaps
            WHERE chain_str=s.chain_str AND block_number <= ${blockNumber}
            ORDER BY block_number DESC
            LIMIT 1
        ) AS a ON TRUE
        GROUP BY 1, 2
    ) t
    WHERE delegate=${address};
    `
  );

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
 * @returns {directVP, advancedVP, totalVP}
 */
export const getCurrentVotingPower = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => addressOrEnsNameWrap(getCurrentVotingPowerForAddress, addressOrENSName);

async function getCurrentVotingPowerForAddress({
  address,
}: {
  address: string;
}): Promise<{
  directVP: string;
  advancedVP: string;
  totalVP: string;
}> {
  const votingPower = await prisma.votingPower.findFirst({
    where: {
      delegate: address,
    },
  });

  // This query pulls only partially delegated voting power
  const advancedVotingPower = await prisma.advancedVotingPower.findFirst({
    where: {
      delegate: address,
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
 * @returns {votingPower}
 */
export const getVotingPowerAvailableForSubdelegation = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) =>
  addressOrEnsNameWrap(
    getVotingPowerAvailableForSubdelegationForAddress,
    addressOrENSName
  );

async function getVotingPowerAvailableForSubdelegationForAddress({
  address,
}: {
  address: string;
}): Promise<string> {
  const advancedVotingPower = await prisma.advancedVotingPower.findFirst({
    where: {
      delegate: address,
    },
  });

  const undelegatedVotingPower = (async () => {
    const [isBalanceAccountedFor, balance] = await Promise.all([
      isAddressDelegatingToProxy({ address }),
      OptimismContracts.token.contract.balanceOf(address),
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
 * @returns {votingPower}
 */
export const getVotingPowerAvailableForDirectDelegation = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) =>
  addressOrEnsNameWrap(
    getVotingPowerAvailableForDirectDelegationForAddress,
    addressOrENSName
  );

async function getVotingPowerAvailableForDirectDelegationForAddress({
  address,
}: {
  address: string;
}): Promise<bigint> {
  return OptimismContracts.token.contract.balanceOf(address);
}

/**
 * Checks if a user has delegated to its proxy
 * @param address
 * @returns {boolean}
 */
export const isDelegatingToProxy = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => addressOrEnsNameWrap(isAddressDelegatingToProxy, addressOrENSName);

async function isAddressDelegatingToProxy({
  address,
}: {
  address: string;
}): Promise<boolean> {
  const [proxyAddress, delegatee] = await Promise.all([
    getProxyAddress(address),
    prisma.delegatees.findFirst({
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
 * @returns {string}
 */
export const getProxy = ({ addressOrENSName }: { addressOrENSName: string }) =>
  addressOrEnsNameWrap(getProxyAddressForAddress, addressOrENSName);

async function getProxyAddressForAddress({
  address,
}: {
  address: string;
}): Promise<string> {
  return getProxyAddress(address);
}
