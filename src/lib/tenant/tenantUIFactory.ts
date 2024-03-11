import { TenantNamespace } from "@/lib/types";
import { TENANT_NAMESPACES } from "@/lib/constants";
import optimismLogo from "@/assets/logos/optimism.svg";

export default class TenantUIFactory {
  public static create(namespace: TenantNamespace): any {
    switch (namespace) {
      case TENANT_NAMESPACES.OPTIMISM:
      case TENANT_NAMESPACES.ENS:
      case TENANT_NAMESPACES.ETHERFI:
        return optimismUI;
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}

const optimismUI = {
  title: "Agora is the home of Optimism voters",
  description:
    "OP Delegates are the stewards of the Optimism Token House, appointed by token holders to make governance decisions on their behalf.",

  logos: {
    svg: optimismLogo,
  },
  colors: {
    primary: "#FF0000",
    secondary: "#FFFFFF",
  },

  toggles: [],

  pages: [
    {
      route: "/",
      title: "Agora is the home of Optimism voters",
      description:
        "OP Citizens are the stewards of the Optimism Citizens' House, selected based on the reputation as the Optimism Collective members.",
    },
    {
      route: "delegates",
      title: "Agora is the home of Optimism voters",
      description:
        "OP Delegates are the stewards of the Optimism Token House, appointed by token holders to make governance decisions on their behalf.",
    },
  ],
};
