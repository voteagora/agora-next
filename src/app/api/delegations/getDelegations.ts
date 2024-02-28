import {
  getCurrentDelegatees,
  getCurrentDelegators,
} from "../common/delegations/getDelegations";
import {
  getProxy,
  getVotingPowerAvailableForDirectDelegation,
  getVotingPowerAvailableForSubdelegation,
  isDelegatingToProxy,
} from "@/app/api/common/voting-power/getVotingPower";

export const getAllForAForAdvancedDelegation = async (address: string) => {
  return await Promise.all([
    getVotingPowerAvailableForSubdelegation({ addressOrENSName: address }),
    isDelegatingToProxy({ addressOrENSName: address }),
    getCurrentDelegatees(address),
    getProxy({ addressOrENSName: address }),
    getCurrentDelegators(address),
    getVotingPowerAvailableForDirectDelegation({ addressOrENSName: address }),
  ]);
};
