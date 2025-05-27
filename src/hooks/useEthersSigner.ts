import { getPublicClient } from "@/lib/viem";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useAccount } from "wagmi";

export function useEthersSigner() {
  const client = getPublicClient();
  const { address } = useAccount();
  const { chain, transport } = client;
  if (!address) {
    return;
  }
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, address);
  return signer;
}
