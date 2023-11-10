import { getDefaultProvider } from "ethers";
import { MulticallWrapper, MulticallProvider } from "ethers-multicall-provider";

declare global {
  var provider: MulticallProvider;
}

let provider: MulticallProvider;

if (process.env.NODE_ENV === "production") {
  provider = MulticallWrapper.wrap(
    getDefaultProvider("optimism", {
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
}

export default provider;
