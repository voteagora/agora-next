import { TenantUI } from "@/lib/tenant/tenantUI";
import ensLogo from "@/assets/tenant/ens_logo.svg";
import successImage from "@/assets/tenant/ens_success.svg";
import pendingImage from "@/assets/tenant/ens_pending.svg";
import delegateAvatar from "@/assets/icons/delegateAvatar.svg";

export const ensTenantUIConfig = new TenantUI({
  title: "ENS Agora",
  color: "#5BAAF4",
  logo: ensLogo,

  assets: {
    // TODO: Replace success and pending images
    success: successImage,
    pending: pendingImage,
    delegate: delegateAvatar,
  },

  organization: {
    title: "ENS Foundation",
  },

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
    {
      name: "proposal-lifecycle",
      enabled: true,
    },
  ],
});
