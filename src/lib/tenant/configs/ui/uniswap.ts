import { TenantUI } from "@/lib/tenant/tenantUI";
import uniswapHero from "@/assets/tenant/uniswap_hero.svg";
import uniswapLogo from "@/assets/tenant/uniswap_logo.svg";
import successImage from "@/assets/tenant/optimism_success.svg";
import pendingImage from "@/assets/tenant/optimism_pending.svg";
import delegateImage from "@/assets/tenant/uniswap_delegate.svg";

export const uniswapTenantUIConfig = new TenantUI({
  title: "Uniswap Agora",
  color: "#FF007A",
  hero: uniswapHero,
  logo: uniswapLogo,

  assets: {
    // TODO: Replace success and pending images
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Uniswap Foundation",
  },

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
    {
      name: "delegates/edit",
      enabled: true,
    },
  ],
});
