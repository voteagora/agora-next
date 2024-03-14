import {
  getCurrentAdvancedDelegators,
  getCurrentDelegatees,
} from "../common/delegations/getDelegations";
import {
  getProxy,
  getVotingPowerAvailableForDirectDelegation,
  getVotingPowerAvailableForSubdelegation,
  isDelegatingToProxy,
} from "@/app/api/common/voting-power/getVotingPower";

export const getAllForAForAdvancedDelegation = async (address: string) => {
  return await Promise.all([
    getVotingPowerAvailableForSubdelegation(address),
    isDelegatingToProxy(address),
    getCurrentDelegatees(address),
    getProxy(address),
    getCurrentAdvancedDelegators(address),
    getVotingPowerAvailableForDirectDelegation(address),
  ]);
};
