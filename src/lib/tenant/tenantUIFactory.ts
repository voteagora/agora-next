import { TenantNamespace } from "@/lib/types";

import { TENANT_NAMESPACES } from "@/lib/constants";
import { TenantUI } from "@/lib/tenant/tenantUI";
import optimismLogo from "@/assets/tenant/optimism_logo.svg";
import optimismHero from "@/assets/tenant/optimism_hero.svg";
import ensLogo from "@/assets/tenant/ens_logo.svg";
import etherfiLogo from "@/assets/tenant/etherfi_logo.svg";
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
  title: "ether.fi Agora",
  color: "#2F38FF",
  hero: etherfiHero,
  logo: etherfiLogo,

  delegates: {
    allowed: [
      "0x454b5f1458782a06da4656de844e019f26e3280a",
      "0x5610b146978c4864d603a855fdea54e6a2c1c803",
      "0x57ab7ee15ce5ecacb1ab84ee42d5a9d0d8112922",
      "0x648aa14e4424e0825a5ce739c8c68610e143fb79",
      "0x83108a0653a14eaeb8301e7b10a37cfac39c82f6",
      "0x9506429a421757711806c5caf25ba1830e349b09",
      "0xaeb24ebe192c2f1c12a940d00fe853558a5edc04",
      "0xfdfc6e1bbec01288447222fc8f1aee55a7c72b7b",
      "0x9ee69759585aa3a9379b066f3caecbbd62420f9d",
    ],
    advanced: [],
    retired: [],
  },
  links: [
    {
      name: "discord",
      title: "Discord",
      url: "https://discord.gg/vBJkUYBuwX",
    },
    {
      name: "bugs",
      title: "Report bugs & feedback",
      url: "https://app.deform.cc/form/7180b273-7662-4f96-9e66-1eae240a52bc",
    },
    {
      name: "governanceForum",
      title: "Governance Forum",
      url: "https://governance.ether.fi/",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of ether.fi governance",
      description:
        "ether.fi governance is launching now. Start by claiming your token and joining Discourse to engage in the discussion. Delegation and voting are coming soon.",
      meta: {
        title: "ether.fi Agora",
        description: "Home of token governance",
      },
    },
    {
      route: "info",
      title: "Agora is the home of ether.fi governance",
      description:
        "ether.fi governance is launching now. Start by claiming your token and joining Discourse to engage in the discussion. Delegation and voting are coming soon.",
      meta: {
        title: "ether.fi Agora",
        description: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of ether.fi delegates",
      description:
        "ether.fi voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "proposals",
      href: "https://snapshot.org/#/etherfi-dao.eth",
      title: "Agora is the home of ether.fi delegates",
      description:
        "ether.fi voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "ether.fi Agora",
        description: "Home of token governance",
      },
    },
  ],

  toggles: [
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "info",
      enabled: true,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "delegates/edit",
      enabled: false,
    },
  ],
});

const ensUI = new TenantUI({
  title: "ENS Agora",
  color: "#5BAAF4",
  logo: ensLogo,

  pages: [
    {
      route: "/",
      title: "Agora is the home of ENS voters",
      description:
        "Tokenholders of $ENS delegate votes to Delegates, who participate in the governance of the ENS protocol by voting on DAO proposals. You can see all of the Delegates below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "ENS Agora",
        description: "Home of token governance",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of ENS voters",
      description:
        "Tokenholders of $ENS delegate votes to Delegates, who participate in the governance of the ENS protocol by voting on DAO proposals. You can see all of the Delegates below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "ENS Agora",
        description: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of ENS voters",
      description:
        "Tokenholders of $ENS delegate votes to Delegates, who participate in the governance of the ENS protocol by voting on DAO proposals. You can see all of the Delegates below, delegate your votes to them, or contact them about your ideas.",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
      },
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
      name: "delegates/edit",
      enabled: true,
    },
  ],
});

const optimismUI = new TenantUI({
  title: "Optimism Agora",
  color: "#FF0420",
  logo: optimismLogo,
  hero: optimismHero,

  delegates: {
    allowed: [],
    advanced: [],
    retired: [
      "0x5e349eca2dc61abcd9dd99ce94d04136151a09ee", // lindajxie.eth
    ],
  },

  links: [
    {
      name: "calendar",
      title: "Governance calendar",
      url: "https://calendar.google.com/calendar/ical/c_fnmtguh6noo6qgbni2gperid4k%40group.calendar.google.com/public/basic.ics",
    },
    {
      name: "faq",
      title: "FAQ",
      url: "https://agoraxyz.notion.site/Optimism-Agora-FAQ-3922ac9c66e54a21b5de16be9e0cf79c?pvs=74",
    },
    {
      name: "changelog",
      title: "Change log",
      url: "/changelog",
    },
    {
      name: "discord",
      title: "Discord",
      url: "https://discord.gg/vBJkUYBuwX",
    },
    {
      name: "bugs",
      title: "Report bugs & feedback",
      url: "https://app.deform.cc/form/7180b273-7662-4f96-9e66-1eae240a52bc",
    },
    {
      name: "governanceForum",
      title: "Governance Forum",
      url: "https://gov.optimism.io/",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of Optimism voters",
      description:
        "OP Delegates are the stewards of the Optimism Token House, appointed by token holders to make governance decisions on their behalf.",
      meta: {
        title: "Optimism Agora",
        description: "Home of token house governance and RPGF",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Optimism voters",
      description:
        "OP Delegates are the stewards of the Optimism Token House, appointed by token holders to make governance decisions on their behalf.",
      meta: {
        title: "Optimism Agora",
        description: "Home of token house governance and RPGF",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Optimism voters",
      description:
        "OP Delegates are the stewards of the Optimism Token House, appointed by token holders to make governance decisions on their behalf.",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
      },
    },
  ],

  toggles: [
    {
      name: "admin",
      enabled: true,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "proposals/create",
      enabled: true,
    },
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "delegates/edit",
      enabled: true,
    },
    {
      name: "delegates/code-of-conduct",
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
