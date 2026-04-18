import Tenant from "@/lib/tenant/tenant";
import {
  DraftProposalTypeOption,
  DraftVotingModuleType,
  PLMConfig,
} from "../types";
import { getProposalTypeAddress } from "./stages";

export const getProposalTypeMetaDataForTenant = (
  proposalTypes: DraftProposalTypeOption[]
) => {
  const { ui } = Tenant.current();
  const plmToggle = ui.toggle("proposal-lifecycle");

  const enabledProposalTypesFromConfig = (
    (plmToggle?.config as PLMConfig)?.proposalTypes || []
  ).map((proposalType) => proposalType.type);

  const proposalTypeMap = new Map<DraftVotingModuleType, boolean>();

  proposalTypes.forEach((proposalType) => {
    const name = proposalType.name.toLowerCase();
    const moduleAddress = proposalType.module?.toLowerCase();

    let optimisticModuleAddress: string | null = null;
    let approvalModuleAddress: string | null = null;

    try {
      optimisticModuleAddress =
        getProposalTypeAddress(
          DraftVotingModuleType.OPTIMISTIC
        )?.toLowerCase() || null;

      approvalModuleAddress =
        getProposalTypeAddress(DraftVotingModuleType.APPROVAL)?.toLowerCase() ||
        null;
    } catch (error) {
      // ignore
    }

    if (name.includes("social")) {
      proposalTypeMap.set(DraftVotingModuleType.SOCIAL, true);
    } else if (
      (moduleAddress && moduleAddress === approvalModuleAddress) ||
      name.includes("approval")
    ) {
      proposalTypeMap.set(DraftVotingModuleType.APPROVAL, true);
    } else if (
      (moduleAddress && moduleAddress === optimisticModuleAddress) ||
      name.includes("optimistic")
    ) {
      proposalTypeMap.set(DraftVotingModuleType.OPTIMISTIC, true);
    } else {
      proposalTypeMap.set(DraftVotingModuleType.BASIC, true);
    }
  });

  // Filter the mapped types based on what's enabled in the config
  const enabledProposalTypesFromAPI = Array.from(proposalTypeMap.keys())
    .filter((type) =>
      enabledProposalTypesFromConfig.some(
        (configType) => configType.toLowerCase() === type
      )
    )
    .sort((a, b) => {
      const order = {
        [DraftVotingModuleType.BASIC]: 0,
        [DraftVotingModuleType.APPROVAL]: 1,
        [DraftVotingModuleType.OPTIMISTIC]: 2,
        [DraftVotingModuleType.SOCIAL]: 3,
      };
      return order[a] - order[b];
    });

  return enabledProposalTypesFromAPI;
};
