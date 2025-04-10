import { TENANT_NAMESPACES } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import optimismLogo from "@/assets/tenant/optimism_share_logo.svg";
import scrollLogo from "@/assets/tenant/scroll_logo.svg";
import deriveLogo from "@/assets/tenant/derive_logo.svg";
import uniswapLogo from "@/assets/tenant/uniswap_logo.svg";
import xaiLogo from "@/assets/tenant/xai_logo.svg";
import etherfiLogo from "@/assets/tenant/etherfi_logo.svg";
import ensLogo from "@/assets/tenant/ens_logo.svg";
import cyberLogo from "@/assets/tenant/cyber_logo.svg";
import boostLogo from "@/assets/tenant/boost_logo.svg";
import b3Logo from "@/assets/tenant/b3_logo.svg";
import pguildLogo from "@/assets/tenant/pguild_logo.svg";
import Image from "next/image";
export const ogLogoForShareVote = () => {
  const { namespace } = Tenant.current();
  switch (namespace) {
    case TENANT_NAMESPACES.SCROLL:
      return (
        <Image
          src={scrollLogo}
          alt="Scroll Logo"
          className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px]"
        />
      );
    case TENANT_NAMESPACES.PGUILD:
      return (
        <Image
          src={pguildLogo}
          alt="PGuild Logo"
          className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px]"
        />
      );
    case TENANT_NAMESPACES.B3:
      return (
        <Image
          src={b3Logo}
          alt="B3 Logo"
          className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px]"
        />
      );
    case TENANT_NAMESPACES.BOOST:
      return (
        <Image
          src={boostLogo}
          alt="Boost Logo"
          className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px]"
        />
      );

    case TENANT_NAMESPACES.CYBER:
      return (
        <Image
          src={cyberLogo}
          alt="Cyber Logo"
          className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px]"
        />
      );

    case TENANT_NAMESPACES.ENS:
      return (
        <Image
          src={ensLogo}
          alt="ENS Logo"
          className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px]"
        />
      );

    case TENANT_NAMESPACES.ETHERFI:
      return (
        <Image
          src={etherfiLogo}
          alt="Etherfi Logo"
          className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px]"
        />
      );

    case TENANT_NAMESPACES.XAI:
      return (
        <Image
          src={xaiLogo}
          alt="Xai Logo"
          className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px]"
        />
      );

    case TENANT_NAMESPACES.UNISWAP:
      return (
        <Image
          src={uniswapLogo}
          alt="Uniswap Logo"
          className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px]"
        />
      );
    case TENANT_NAMESPACES.DERIVE:
      return (
        <Image
          src={deriveLogo}
          alt="Derive Logo"
          className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px]"
        />
      );

    case TENANT_NAMESPACES.OPTIMISM:
    default:
      return (
        <Image
          src={optimismLogo}
          alt="Optimism Logo"
          className="w-[52px] h-[52px] sm:w-[80px] sm:h-[80px]"
        />
      );
  }
};
