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
  // Return an array of zeros/empty values matching the expected structure
  return [
    BigInt(0), // voting power for subdelegation
    false, // isDelegatingToProxy
    [], // current delegatees
    "", // proxy address
    [], // current advanced delegators
    BigInt(0), // voting power for direct delegation
  ];
};
