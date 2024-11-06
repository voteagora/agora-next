import { TenantUI } from "@/lib/tenant/tenantUI";
import deriveHero from "@/assets/tenant/derive_hero.svg";
import deriveLogo from "@/assets/tenant/derive_logo.svg";
import delegateImage from "@/assets/tenant/derive_delegate.svg";
import successImage from "@/assets/tenant/derive_success.svg";
import pendingImage from "@/assets/tenant/derive_pending.svg";

export const deriveTenantUIConfig = new TenantUI({
  title: "Derive Agora",
  logo: deriveLogo,

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Derive DAO",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  links: [
    {
      name: "discord",
      title: "Discord",
      url: "https://discord.com/invite/Derive",
    },
  ],

  smartAccountConfig: {
    factoryAddress: "0x0000000000400CdFef5E2714E63d8040b700BC24",
    version: "v2.0.0",
    type: "LightAccount",
    salt: BigInt(0),
  },

  pages: [
    {
      route: "/",
      title: "Agora is the home of Derive governance",
      description: "Derive governance is launching now. ",
      hero: deriveHero,
      meta: {
        title: "Derive Agora",
        description: "Home of token governance",
        imageTitle: "Derive Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "info",
      title: "Agora is the home of Derive governance",
      description: "Derive governance is launching now.",
      hero: deriveHero,
      meta: {
        title: "Derive Agora",
        description: "Home of token governance",
        imageTitle: "Derive Agora",
        imageDescription: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Derive delegates",
      description:
        "Derive voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      hero: deriveHero,
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "Voter on Agora",
        imageDescription:
          "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Derive delegates",
      description:
        "Derive voters are the stewards for the DAO. You can see them all below, delegate your votes to them, or contact them about your ideas.",
      hero: deriveHero,
      meta: {
        title: "Derive Agora",
        description: "Home of token governance",
        imageTitle: "Derive Agora",
        imageDescription: "Home of token governance",
      },
    },
  ],

  toggles: [
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "delegates/edit",
      enabled: true,
    },
  ],
});
