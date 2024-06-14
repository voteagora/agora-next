import Tenant from "@/lib/tenant/tenant";

const infoColor = {
  optimism: {
    primary: "#FF0420",
    gradient: "linear-gradient(180deg, rgba(255, 4, 32, 0.6) 0%, #FFFFFF 100%)",
    primaryRGB: "rgba(255, 4, 32, 1)",
  },
  uniswap: {
    primary: "#FF007A",
    gradient:
      "linear-gradient(180deg, rgba(255, 0, 122, 0.6) 0%, #FFFFFF 100%)",
    primaryRGB: "rgba(255, 0, 122, 1)",
  },
  scroll: {
    primary: "#EDCCA2",
    gradient:
      "linear-gradient(180deg, rgba(237, 204, 162, 0.6) 0%, #FFFFFF 100%)",
    primaryRGB: "rgba(237, 204, 162, 1)",
  },
};

const useColorPicker = () => {
  const { namespace } = Tenant.current();

  if (namespace in infoColor) {
    return {
      primary: infoColor[namespace as keyof typeof infoColor].primary,
      gradient: infoColor[namespace as keyof typeof infoColor].gradient,
      primaryRGB: infoColor[namespace as keyof typeof infoColor].primaryRGB,
    };
  }

  return {
    primary: "",
    gradient: "",
    primaryRGB: "",
  };
};

export default useColorPicker;
