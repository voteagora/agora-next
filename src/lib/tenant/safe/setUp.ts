import SafeApiKit from "@safe-global/api-kit";
import Safe from "@safe-global/protocol-kit";
import { getPublicClient } from "@/lib/viem";

const publicClient = getPublicClient();

// Initialize the Safe API Kit with Ethereum Mainnet (chain ID 1)
export const safeApiKit = new SafeApiKit({
  chainId: BigInt(publicClient.chain?.id ?? 1),
});

export const initProtocolKit = async (
  safeAddress: string,
  signerAddress: string,
  provider: any
) => {
  try {
    // Initialize the Protocol Kit with the provider URL
    return await Safe.init({
      provider,
      safeAddress,
      signer: signerAddress,
    });
  } catch (error) {
    console.error("Error initializing Protocol Kit:", error);
    throw error;
  }
};
