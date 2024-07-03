import { TenantUI } from "@/lib/tenant/tenantUI";
import uniswapHero from "@/assets/tenant/uniswap_hero.svg";
import uniswapLogo from "@/assets/tenant/uniswap_logo.svg";
import successImage from "@/assets/tenant/uniswap_success.svg";
import pendingImage from "@/assets/tenant/uniswap_pending.svg";
import delegateImage from "@/assets/tenant/uniswap_delegate.svg";
import infoPageCard01 from "@/assets/tenant/uniswap_info_1.png";
import infoPageCard02 from "@/assets/tenant/uniswap_info_2.png";
import infoPageCard03 from "@/assets/tenant/uniswap_info_3.png";
import infoPageCard04 from "@/assets/tenant/uniswap_info_4.png";

export const uniswapTenantUIConfig = new TenantUI({
  title: "Uniswap Agora",
  color: "#FF007A",
  hero: uniswapHero,
  logo: uniswapLogo,

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Uniswap Foundation",
  },

  topGovernanceIssues: [
    {
      icon: "wallet",
      title: "Cross Chain deployments",
      key: "cross-chain-deployments",
    },
    {
      icon: "community",
      title: "DAO working groups",
      key: "dao-working-groups",
    },
    {
      icon: "piggyBank",
      title: "Fee tiers",
      key: "fee-tiers",
    },
    {
      icon: "measure",
      title: "Mechanism design",
      key: "mechanism-design",
    },
    {
      icon: "users",
      title: "Public goods",
      key: "public-goods",
    },
    {
      icon: "ballot",
      key: "other",
      title: "Other",
    },
  ],

  pages: [
    {
      route: "/",
      title: "Agora is the home of Uniswap governance",
      description:
        "Uniswap governance is a collective of companies, communities, and token holders working together to steward the future of the Uniswap protocol",
      meta: {
        title: "Uniswap Agora",
        description: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Uniswap delegates",
      description:
        " Uniswap governance is a collective of companies, communities, and token holders working together to steward the future of the Uniswap protocol",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Uniswap delegates",
      description:
        "Uniswap governance is a collective of companies, communities, and token holders working together to steward the future of the Uniswap protocol",
      meta: {
        title: "Uniswap Agora",
        description: "Home of token governance",
      },
    },
    {
      route: "info",
      title: "Uniswap Protocol Governance",
      description:
        "Uniswap is a public good owned and governed by UNI token holders.",
      meta: {
        title: "Info of Agora",
        description: "Welcome to the Optimism Collective",
      },
      links: [
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://discord.com/invite/FCfyBSbCU5",
          image: infoPageCard01,
        },
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "https://gov.uniswap.org",
          image: infoPageCard02,
        },
        {
          name: "Protocol Docs",
          title: "Protocol Docs",
          url: "https://docs.uniswap.org",
          image: infoPageCard03,
        },
        {
          name: "Uniswap Labs",
          title: "Uniswap Labs",
          url: "https://x.com/Uniswap",
          image: infoPageCard04,
        },
      ],
    },
  ],

  toggles: [
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "delegates/code-of-conduct",
      enabled: true,
    },
    {
      name: "delegates/edit",
      enabled: true,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "staking",
      enabled: false,
    },
    {
      name: "info",
      enabled: true,
    },
  ],
});
