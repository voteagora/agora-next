import {
  fetchCurrentDelegatees,
  fetchCurrentAdvancedDelegators,
} from "../common/delegations/getDelegations";
import {
  fetchProxy,
  fetchVotingPowerAvailableForDirectDelegation,
  fetchVotingPowerAvailableForSubdelegation,
  fetchIsDelegatingToProxy,
} from "@/app/api/common/voting-power/getVotingPower";

export const fetchAllForAdvancedDelegation = async (address: string) => {
  return await Promise.all([
    fetchVotingPowerAvailableForSubdelegation(address),
    fetchIsDelegatingToProxy(address),
    fetchCurrentDelegatees(address),
    fetchProxy(address),
    fetchCurrentAdvancedDelegators(address),
    fetchVotingPowerAvailableForDirectDelegation(address),
  ]);
};
