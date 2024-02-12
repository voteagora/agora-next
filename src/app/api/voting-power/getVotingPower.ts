import {
  getCurrentVotingPowerForNamespace,
  getProxyForNamespace,
  getVotingPowerForProposalForNamespace,
  getVotingPowerAvailableForDirectDelegationForNamespace,
  getVotingPowerAvailableForSubdelegationForNamespace,
  isDelegatingToProxyForNamespace,
} from "../common/voting-power/getVotingPower";

/**
 * Voting Power at a given block number
 * @param address
 * @param blockNumber
 * @returns VotingPowerData
 */
export const getVotingPowerForProposal = ({
  addressOrENSName,
  blockNumber,
  proposalId,
}: {
  addressOrENSName: string;
  blockNumber: number;
  proposalId: string;
}) =>
  getVotingPowerForProposalForNamespace({
    addressOrENSName,
    blockNumber,
    proposalId,
    namespace: "optimism",
  });

/**
 * Voting Power
 * @param address
 * @returns VotingPowerData
 */
export const getCurrentVotingPower = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) =>
  getCurrentVotingPowerForNamespace({
    addressOrENSName,
    namespace: "optimism",
  });

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
  getVotingPowerAvailableForSubdelegationForNamespace({
    addressOrENSName,
    namespace: "optimism",
  });

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
  getVotingPowerAvailableForDirectDelegationForNamespace({
    addressOrENSName,
    namespace: "optimism",
  });

/**
 * Checks if a user has delegated to its proxy
 * @param address
 * @returns {boolean}
 */
export const isDelegatingToProxy = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) =>
  isDelegatingToProxyForNamespace({ addressOrENSName, namespace: "optimism" });

/**
 * Gets the proxy address for a given address
 * @param address
 * @returns {string}
 */
export const getProxy = ({ addressOrENSName }: { addressOrENSName: string }) =>
  getProxyForNamespace({ addressOrENSName, namespace: "optimism" });
