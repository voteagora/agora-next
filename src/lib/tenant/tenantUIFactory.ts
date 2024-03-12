import { TenantNamespace } from "@/lib/types";

import { TENANT_NAMESPACES } from "@/lib/constants";
import { TenantUI } from "@/lib/tenant/tenantUI";
import optimismLogo from "@/assets/tenant/optimism.svg";
import ensLogo from "@/assets/tenant/ens.svg";
import etherfiHero from "@/assets/tenant/etherfi_hero.svg";

export default class TenantUIFactory {
  public static create(namespace: TenantNamespace): any {
    switch (namespace) {
      case TENANT_NAMESPACES.OPTIMISM:
        return optimismUI;
      case TENANT_NAMESPACES.ETHERFI:
        return etherfiUI;

      case TENANT_NAMESPACES.ENS:
        return ensUI;
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}

const etherfiUI = new TenantUI({

  title: "Agora is the home of ETHER.FI delegates",
  description: "ETHER.FI voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
  hero: etherfiHero,

  toggles: [
    {
      name: "delegates",
      enabled: true,
    },
  ],
});

const ensUI = new TenantUI(
  {
    title: "Agora is the home of ENS voters",
    description: "Tokenholders of $ENS delegate votes to Delegates, who participate in the governance of the ENS protocol by voting on DAO proposals. You can see all of the Delegates below, delegate your votes to them, or contact them about your ideas.",
    hero: etherfiHero,
    logo: ensLogo,

    toggles: [
      {
        name: "proposals",
        enabled: true,
      },
      {
        name: "delegates",
        enabled: true,
      },
    ],
  },
);

const optimismUI = new TenantUI({
  title: "Agora is the home of Optimism voters",
  description: "OP Delegates are the stewards of the Optimism Token House, appointed by token holders to make governance decisions on their behalf.",
  hero: "path_to_the_hero_image",
  logo: optimismLogo,

  pages: [
    {
      route: "citizens",
      title: "Agora is the home of Optimism voters",
      description: "OP Citizens are the stewards of the Optimism Citizens' House, selected based on the reputation as the Optimism Collective members.",
    },
    {
      route: "delegates",
      title: "Agora is the home of Optimism voters",
      description: "OP Delegates are the stewards of the Optimism Token House, appointed by token holders to make governance decisions on their behalf.",
    },
  ],

  toggles: [
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "retropgf",
      enabled: true,
    },
    {
      name: "citizens",
      enabled: true,
    },
  ],
});
