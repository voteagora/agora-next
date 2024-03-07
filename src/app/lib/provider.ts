import { getDefaultProvider } from "ethers";
import { MulticallProvider, MulticallWrapper } from "ethers-multicall-provider";

declare global {
  var provider: MulticallProvider;
  var ethProvider: MulticallProvider;
}

let provider: MulticallProvider;
let ethProvider: MulticallProvider;

if (process.env.NODE_ENV === "production") {
  provider = MulticallWrapper.wrap(
    getDefaultProvider("optimism", {
      alchemy: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    })
  );
  ethProvider = MulticallWrapper.wrap(
    getDefaultProvider("mainnet", {
      alchemy: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    })
  );
} else {
  if (!global.provider) {
    global.provider = MulticallWrapper.wrap(
      getDefaultProvider("optimism", {
        alchemy: process.env.NEXT_PUBLIC_ALCHEMY_ID,
      })
    );
  }
  provider = global.provider;

  if (!global.ethProvider) {
    global.ethProvider = MulticallWrapper.wrap(
      getDefaultProvider("mainnet", {
        alchemy: process.env.NEXT_PUBLIC_ALCHEMY_ID,
      })
    );
  }

  ethProvider = global.ethProvider;
}

export default provider;
export { ethProvider };
