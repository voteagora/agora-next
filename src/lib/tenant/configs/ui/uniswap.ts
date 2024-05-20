import { TenantUI } from "@/lib/tenant/tenantUI";
import uniswapHero from "@/assets/tenant/uniswap_hero.svg";
import uniswapLogo from "@/assets/tenant/uniswap_logo.svg";

export const uniswapTenantUIConfig = new TenantUI({
  title: "Uniswap Agora",
  color: '#FF007A',
  hero: uniswapHero,
  logo: uniswapLogo,

  organization: {
    title: "Uniswap Foundation",
  },

  pages: [
    {
      route: "/",
      title: "Agora is the home of Uniswap governance",
      description: "Add copy here",
      meta: {
        title: "Uniswap Agora",
        description: "Home of token governance",
      },
    },
    {
      route: "delegates",
      title: "Agora is the home of Uniswap delegates",
      description: " Add copy here",
      meta: {
        title: "Voter on Agora",
        description: "Delegate your voting power to a trusted representative",
      },
    },
    {
      route: "proposals",
      title: "Agora is the home of Uniswap delegates",
      description: "Add copy here",
      meta: {
        title: "Uniswap Agora",
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
      name: "proposals",
      enabled: true,
    },
    {
      name: "staking",
      enabled: true,
    },
  ],
});
