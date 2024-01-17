import { DEPLOYMENT_NAME } from "./config";
import { OptimismContracts } from "./contracts/contracts";

export async function getProxyAddress(address: string) {
  switch (DEPLOYMENT_NAME) {
    case "optimism": {
      return OptimismContracts.alligator.contract.proxyAddress(address);
    }
    default: {
      throw new Error("Can't find Agora Instance token");
    }
  }
}
