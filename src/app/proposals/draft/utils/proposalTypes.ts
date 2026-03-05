import Tenant from "@/lib/tenant/tenant";
import { PLMConfig, ProposalType } from "../types";
import { getProposalTypeAddress } from "./stages";

export const getProposalTypeMetaDataForTenant = (proposalTypes: any[]) => {
  const { ui } = Tenant.current();
  const plmToggle = ui.toggle("proposal-lifecycle");

  const enabledProposalTypesFromConfig = (
    (plmToggle?.config as PLMConfig)?.proposalTypes || []
  ).map((pt: any) => pt.type);

  const proposalTypeMap = new Map<string, boolean>();

  proposalTypes.forEach((proposalType) => {
    const name = proposalType.name.toLowerCase();
    const moduleAddress = proposalType.module?.toLowerCase();

    let optimisticModuleAddress: string | null = null;
    let optimisticExecutableModuleAddress: string | null = null;
    let approvalModuleAddress: string | null = null;

    try {
      optimisticModuleAddress =
        getProposalTypeAddress(ProposalType.OPTIMISTIC)?.toLowerCase() || null;
      optimisticExecutableModuleAddress =
        getProposalTypeAddress(
          ProposalType.OPTMISTIC_EXECUTABLE
        )?.toLowerCase() || null;

      approvalModuleAddress =
        getProposalTypeAddress(ProposalType.APPROVAL)?.toLowerCase() || null;
    } catch (error) {
      // ignore
    }

    if (name.includes("social")) {
      proposalTypeMap.set("social", true);
    } else if (
      (moduleAddress && moduleAddress === approvalModuleAddress) ||
      name.includes("approval")
    ) {
      proposalTypeMap.set("approval", true);
    } else if (
      (moduleAddress && moduleAddress === optimisticModuleAddress) ||
      name.includes("optimistic")
    ) {
      proposalTypeMap.set("optimistic", true);
    } else if (
      (moduleAddress && moduleAddress === optimisticExecutableModuleAddress) ||
      name.includes("optimistic executable")
    ) {
      proposalTypeMap.set("optimistic executable", true);
    } else {
      proposalTypeMap.set("basic", true);
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
        basic: 0,
        approval: 1,
        optimistic: 2,
        social: 3,
      };
      return order[a as keyof typeof order] - order[b as keyof typeof order];
    });

  return enabledProposalTypesFromAPI;
};
