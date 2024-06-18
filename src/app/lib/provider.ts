import { getDefaultProvider, AlchemyProvider } from "ethers";
import { MulticallProvider, MulticallWrapper } from "ethers-multicall-provider";

// TODO: Andrei - this needs to be refactored into a factory

declare global {
  var provider: MulticallProvider;
  var ethProvider: MulticallProvider;
}

const isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID;

let provider: MulticallProvider;
let ethProvider: MulticallProvider;

const sepoliaProvider = new AlchemyProvider("sepolia", alchemyId);

if (isProd) {
  provider = MulticallWrapper.wrap(
    getDefaultProvider("optimism", {
      alchemy: alchemyId,
    })
  );
  ethProvider = MulticallWrapper.wrap(
    getDefaultProvider("mainnet", {
      alchemy: alchemyId,
    })
  );
} else {
  if (!global.provider) {
    global.provider = MulticallWrapper.wrap(
      getDefaultProvider("optimism", {
        alchemy: alchemyId,
      })
    );
  }
  provider = global.provider;

  if (!global.ethProvider) {
    global.ethProvider = MulticallWrapper.wrap(
      getDefaultProvider("mainnet", {
        alchemy: alchemyId,
      })
    );
  }
  ethProvider = global.ethProvider;
}

export default provider;
export { ethProvider, sepoliaProvider };
