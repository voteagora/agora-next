import { type TenantNamespace, type TenantToken } from "@/lib/types";
import { TENANT_NAMESPACES, ZERO_ADDRESS } from "@/lib/constants";

const isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";

export default class TenantTokenFactory {
  public static create(namespace: TenantNamespace): TenantToken {
    switch (namespace) {
      case TENANT_NAMESPACES.OPTIMISM:
        return {
          name: "Optimism",
          symbol: "OP",
          decimals: 18,
          address: "0x4200000000000000000000000000000000000042",
        };
      case TENANT_NAMESPACES.ENS:
        return {
          name: "ENS",
          symbol: "ENS",
          decimals: 18,
          address: isProd
            ? "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72"
            : "0xca83e6932cf4F03cDd6238be0fFcF2fe97854f67",
        };

      case TENANT_NAMESPACES.ETHERFI:
        return {
          name: "Ether.fi",
          symbol: "ETHFI",
          decimals: 18,
          address: "0xFe2e637202056d30016725477c5da089Ab0A043A",
        };

      case TENANT_NAMESPACES.UNISWAP:
        return {
          name: "Uniswap",
          symbol: "UNI",
          decimals: 18,
          address: isProd
            ? "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
            : "0xc796953c443f542728eedf33aab32753d3f7a91a",
        };

      case TENANT_NAMESPACES.CYBER:
        return {
          name: "Cyber",
          symbol: "cCYBER",
          decimals: 18,
          address: isProd
            ? "0x522d3a9c2bc14ce1c4d210ed41ab239fded02f2b"
            : "0x8dfC3B23EE4ca0b8C4af1e4EC7F72D2efbAB70E3",
        };

      case TENANT_NAMESPACES.DERIVE:
        return {
          name: "Staked Derive",
          symbol: "stDRV",
          decimals: 18,
          address: isProd
            ? "0x7499d654422023a407d92e1D83D387d81BC68De1"
            : "0x47b4Ad50177b8e88F774B4E1D09e590d9cb9e386",
        };

      case TENANT_NAMESPACES.SCROLL:
        return {
          name: "Scroll",
          symbol: "SCR",
          decimals: 18,
          address: isProd
            ? "0xd29687c813D741E2F938F4aC377128810E217b1b"
            : "0xBa61Bf34b51aD4710a784dc5B675df67817FCDa6",
        };

      case TENANT_NAMESPACES.PGUILD:
        return {
          name: "Protocol Guild",
          symbol: "PGUILD",
          decimals: 0,
          address: isProd
            ? "0x95fc87e77977a70b08c76b0a7714069d8ff0ff2b"
            : "0x380afD534539ad1C43c3268E7Cb71BAa766aE6f9",
        };

      case TENANT_NAMESPACES.BOOST:
        return {
          name: "Boost Protocol",
          symbol: "BGUILD",
          decimals: 0,
          address: isProd
            ? "0xcDdf69F9d290F591896DD1A27cbb32E4935D47b6"
            : "0x9323dd7c1fa5f05dc1e922763ae12529133c0848",
        };
      case TENANT_NAMESPACES.XAI:
        return {
          name: "Xai",
          symbol: "vXAI",
          decimals: 18,
          address: isProd
            ? "0x9d9c7d3C7ffe27b8F7b7e6d80AaDeFEC12453A21"
            : "0x415777DeB21bde51369F2218db4618e61419D4Dc",
        };
      case TENANT_NAMESPACES.B3:
        return {
          name: "B3",
          symbol: "B3",
          decimals: 18,
          address: isProd
            ? "0xB3B32F9f8827D4634fE7d973Fa1034Ec9fdDB3B3"
            : "0x375039472E76B393b6ea945eeb1478c869CF8618",
        };
      case TENANT_NAMESPACES.DEMO:
        return {
          name: "Demo",
          symbol: "DEMO",
          decimals: 18,
          address: "0xd5741323b3ddfe5556C3477961B5160600C29c53",
        };
      case TENANT_NAMESPACES.LINEA:
        return {
          name: "Linea",
          symbol: "LINEA",
          decimals: 18,
          address: "0x03A61C68BF297aDffF451426ea8C491bb8F87c65",
        };
      case TENANT_NAMESPACES.TOWNS:
        return {
          name: "Towns Lodge",
          symbol: "TOWNS",
          decimals: 18,
          address: "0x0000000000000000000000000000000000000000",
        };
      case TENANT_NAMESPACES.SHAPE:
        return {
          name: "Shape",
          symbol: "SHAPE",
          decimals: 18,
          address: "0x0000000000000000000000000000000000000000",
        };
      case TENANT_NAMESPACES.SYNDICATE:
        return {
          name: "Syndicate Protocol",
          symbol: "SYNDICATE",
          decimals: 18,
          address: "0x0000000000000000000000000000000000000000",
        };
      case TENANT_NAMESPACES.DEMO2:
        return {
          name: "Demo Governance Token",
          symbol: "DEMO",
          decimals: 18,
          address: isProd
            ? ZERO_ADDRESS
            : "0xf727988dbbeed852760a3876414b8d29f47998d3",
        };
      case TENANT_NAMESPACES.DEMO4:
        return {
          name: "Demo Governance Token",
          symbol: "DEMO4",
          decimals: 18,
          address: isProd
            ? ZERO_ADDRESS
            : "0x54e196a89b17fa042bf7ec8b53dac922f5f714e9",
        };
      case TENANT_NAMESPACES.DEMO3:
        return {
          name: "Demo Governance Token",
          symbol: "DEMO3",
          decimals: 18,
          address: isProd
            ? ZERO_ADDRESS
            : "0xf1f9686d8144c7c5f16feffc8fdf93ec64058dec",
        };
      case TENANT_NAMESPACES.SHAPE:
        return {
          name: "Shape",
          symbol: "SHAPE",
          decimals: 18,
          address: "0x0000000000000000000000000000000000000000",
        };
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
