import provider from "@/app/lib/provider";
import { OptimismContracts } from "./contracts/contracts";

export async function getCurrentQuorum(dao: "OPTIMISM") {
  switch (dao) {
    case "OPTIMISM": {
      const latestBlock = await provider.getBlock("latest");
      if (!latestBlock) {
        return null;
      }
      // latest - 1 because latest block might not be mined yet
      return OptimismContracts.governor.quorum(latestBlock.number - 1);
    }
  }
}
