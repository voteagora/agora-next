import { TenantUI } from "@/lib/tenant/tenantUI";
import cyberHero from "@/assets/tenant/cyber_hero.svg";
import cyberLogo from "@/assets/tenant/cyber_logo.svg";
import delegateImage from "@/assets/tenant/cyber_delegate.svg";
import successImage from "@/assets/tenant/cyber_success.svg";
import pendingImage from "@/assets/tenant/cyber_pending.svg";

export const cyberTenantUIConfig = new TenantUI({
  title: "Cyber Agora",
  hero: cyberHero,
  logo: cyberLogo,

  googleAnalytics: "G-KZ3G1HV72Y",

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Cyber",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  customization: {
    primary: "#171717",
    secondary: "#404040",
    tertiary: "#737373",
    neutral: "#FFFFFF",
    wash: "#FAFAFA",
    line: "#E5E5E5",
    positive: "#00992B",
    negative: "#C52F00",
    brandPrimary: "#171717",
    brandSecondary: "#F2F2F2",
  },

  links: [
    {
      name: "code-of-conduct",
      title: "Code of Conduct",
      url: "https://docs.cyber.co/governance/code-of-conduct",
    },
  ],

  governanceIssues: [
    {
      icon: "piggyBank",
      title: "Grants",
      key: "grants",
    },
    {
      icon: "ballot",
      title: "Decentralization",
      key: "decentralization",
    },
    {
      icon: "globe",
      title: "Ecosystem development",
      key: "ecosystemDevelopment",
    },
    {
      icon: "sparks",
      title: "Public Goods",
      key: "publicGoods",
    },
    {
      icon: "community",
      key: "daoWorkingGroups",
      title: "DAO working groups",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Welcome to the home of Cyber voters",
      description:
        "Cyber delegates are the stewards of CyberDAO. They are volunteers and members of the Cyber community who have been elected to represent other token holders and make governance decisions on their behalf.",
      meta: {
        title: "Welcome to Cyber governance",
        description: "Home of token governance",
        imageTitle: "IN IMAGE",
        imageDescription: "IN IMAGE DESCRIPTION",
      },
    },
    {
      route: "delegates",
      title: "Welcome to the home of Cyber voters",
      description:
        "Cyber delegates are the stewards of CyberDAO. They are volunteers and members of the Cyber community who have been elected to represent other token holders and make governance decisions on their behalf.",
      meta: {
        title: "Contribute to CyberDAO with your staked CYBER",
        description:
          "Cyber Agora is a unified and dedicated delegate portal for CyberDAO governance. Cyber Agora is where all protocol improvement votes are executed. After the discussion phase, all official CyberDAO governance activities occur on the Cyber Agora portal. This includes member delegation, voting, and other matters related to CyberDAO's decentralized governance.",
        imageTitle: "Cyber Governance",
        imageDescription: "Participate in CyberDAO",
      },
    },
    {
      route: "proposals",
      title: "Welcome to Cyber governance",
      description:
        "Cyber delegates are the stewards of the Cyber DAO, appointed by token holders to make governance decisions on their behalf.",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
        imageTitle: "IN IMAGE",
        imageDescription: "IN IMAGE DESCRIPTION",
      },
    },
  ],

  toggles: [
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "delegates/endorsed-filter",
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
  ],
});
