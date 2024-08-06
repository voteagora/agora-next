import { TenantUI } from "@/lib/tenant/tenantUI";
import cyberHero from "@/assets/tenant/cyber_hero.svg";
import cyberLogo from "@/assets/tenant/cyber_logo.svg";
import delegateImage from "@/assets/tenant/cyber_delegate.svg";
import successImage from "@/assets/tenant/cyber_success.svg";
import pendingImage from "@/assets/tenant/cyber_pending.svg";

export const scrollTenantUIConfig = new TenantUI({
  title: "Scroll Agora",
  hero: cyberHero,
  logo: cyberLogo,

  assets: {
    success: successImage,
    pending: pendingImage,
    delegate: delegateImage,
  },

  organization: {
    title: "Scroll DAO",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  customization: {
    primary: "25 6 2",
    secondary: "117 106 103",
    tertiary: "209 205 204",
    neutral: "255 255 255",
    wash: "250 242 232",
    line: "241 217 185",
    positive: "0 153 43",
    negative: "197 47 0",
    brandPrimary: "255 76 0",
    brandSecondary: "255 248 243",
    font: "TransSansPremium",
  },

  pages: [
    {
      route: "/",
      title: "Welcome to the home of Scroll voters",
      description:
        "Scroll delegates are the stewards of ScrollDAO. They are volunteers and members of the Scroll community who have been elected to represent other token holders and make governance decisions on their behalf.",
      meta: {
        title: "Welcome to Scroll governance",
        description: "Home of token governance",
        imageTitle: "Welcome to Scroll governance",
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
