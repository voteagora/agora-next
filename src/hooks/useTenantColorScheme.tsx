import Tenant from "@/lib/tenant/tenant";

const infoColor = {
  optimism: {
    primary: "#3B9BF4",
    primaryRGB: "rgba(255, 4, 32, 1)",
    gradient: {
      startColor: "rgba(59, 155, 244, 0.6)",
      endcolor: "#FFFFFF",
    },
  },
  uniswap: {
    primary: "#FF007A",
    primaryRGB: "rgba(255, 0, 122, 1)",
    gradient: {
      startColor: "rgba(255, 0, 122, 0.6)",
      endcolor: "#FFFFFF",
    },
  },
  scroll: {
    primary: "#EDCCA2",
    primaryRGB: "rgba(237, 204, 162, 1)",
    gradient: {
      startColor: "rgba(237, 204, 162, 0.6)",
      endcolor: "#FFFFFF",
    },
  },
};

const useTenantColorScheme = () => {
  const { namespace } = Tenant.current();

  if (namespace in infoColor) {
    return {
      primary: infoColor[namespace as keyof typeof infoColor].primary,
      gradient: infoColor[namespace as keyof typeof infoColor].gradient,
      primaryRGB: infoColor[namespace as keyof typeof infoColor].primaryRGB,
    };
  }

  return {
    primary: "#FF0420",
    primaryRGB: "rgba(255, 4, 32, 1)",
    gradient: {
      startColor: "(255, 4, 32, 0.6)",
      endcolor: "#FFFFFF",
    },
    uniswap: {
      primary: "#FF007A",
      primaryRGB: "rgba(255, 0, 122, 1)",
      gradient: {
        startColor: "rgba(255, 0, 122, 0.6)",
        endcolor: "#FFFFFF",
      },
    },
    scroll: {
      primary: "#EDCCA2",
      primaryRGB: "rgba(237, 204, 162, 1)",
      gradient: {
        startColor: "rgba(237, 204, 162, 0.6)",
        endcolor: "#FFFFFF",
      },
    },
  };
};

export default useTenantColorScheme;
