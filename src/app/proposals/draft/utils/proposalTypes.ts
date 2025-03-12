import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "../types";

export const getProposalTypeMetaDataForTenant = (proposalTypes: any[]) => {
  const { ui } = Tenant.current();
  const plmToggle = ui.toggle("proposal-lifecycle");

  const enabledProposalTypesFromConfig = (
    (plmToggle?.config as PLMConfig)?.proposalTypes || []
  ).map((pt: any) => pt.type);

  const proposalTypeMap = new Map();

  proposalTypes.forEach((proposalType) => {
    const name = proposalType.name.toLowerCase();

    if (name.includes("approval")) {
      proposalTypeMap.set("approval", true);
    } else if (name.includes("optimistic")) {
      proposalTypeMap.set("optimistic", true);
    } else if (name.includes("social")) {
      proposalTypeMap.set("social", true);
    } else {
      proposalTypeMap.set("basic", true);
    }
  });

  // Filter the mapped types based on what's enabled in the config
  const enabledProposalTypesFromAPI = Array.from(proposalTypeMap.keys()).filter(
    (type) =>
      enabledProposalTypesFromConfig.some(
        (configType) => configType.toLowerCase() === type
      )
  );

  return enabledProposalTypesFromAPI;
};
