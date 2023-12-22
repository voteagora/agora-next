import { DEPLOYMENT_NAME } from "./config";
import { OptimismContracts } from "./contracts/contracts";

// TODO: improve default logic
export async function getProxyAddress(address: string) {
  switch (DEPLOYMENT_NAME) {
    case "optimism": {
      return OptimismContracts.alligator.contract.proxyAddress(address);
    }
    default: {
      return OptimismContracts.alligator.contract.proxyAddress(address);
    }
  }
}
