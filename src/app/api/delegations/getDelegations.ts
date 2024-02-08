import {
  getAllDelegatorsInChainsForAddressForNamespace,
  getCurrentDelegateesForNamespace,
  getCurrentDelegatorsForNamespace,
  getDirectDelegateeForNamespace,
} from "../common/delegations/getDelegations";

/**
 * Delegations for a given address (addresses the given address is delegating to)
 * @param addressOrENSName
 * @returns {delegations}
 */
export const getCurrentDelegatees = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) =>
  getCurrentDelegateesForNamespace({ addressOrENSName, namespace: "optimism" });

/**
 * Delegators for a given address (addresses delegating to the given address)
 * @param addressOrENSName
 * @returns {Delegation[]}
 */
export const getCurrentDelegators = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) =>
  getCurrentDelegatorsForNamespace({ addressOrENSName, namespace: "optimism" });

/**
 * Direct delegatee for a given address
 * @param addressOrENSName
 * @returns {Delegation}
 */

export const getDirectDelegatee = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) =>
  getDirectDelegateeForNamespace({ addressOrENSName, namespace: "optimism" });

/**
 * Get all addresses that are in the delegation chain for a given address
 * @param addressOrENSName
 * @returns {delegations}
 */

export const getAllDelegatorsInChainsForAddress = ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) =>
  getAllDelegatorsInChainsForAddressForNamespace({
    addressOrENSName,
    namespace: "optimism",
  });
