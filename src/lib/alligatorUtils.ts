import { OptimismContracts } from "./contracts/contracts";

export async function getProxyAddress(address: string, namespace: "optimism") {
  switch (namespace) {
    case "optimism": {
      return OptimismContracts.alligator.contract.proxyAddress(address);
    }
    default: {
      throw new Error("Can't find Agora Instance token");
    }
  }
}
