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
    primary: "#190602",
    secondary: "#756A67",
    tertiary: "#D1CDCC",
    neutral: "#FFFFFF",
    wash: "#FAF2E8",
    line: "#FAF2E8",
    positive: "#00992B",
    negative: "#C52F00",
    brandPrimary: "#FF4C00",
    brandSecondary: "#FFF8F3",
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
