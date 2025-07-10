import { useReadContract } from "wagmi";

interface Props {
  address?: string;
  contractAddress: string;
  chainId: number;
  enabled?: boolean;
}

export const useNFTBalance = ({
  address,
  contractAddress,
  chainId,
  enabled = true,
}: Props) => {
  const { data, isFetching, isFetched } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: [
      {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "owner", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
      },
    ],
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    chainId,
    query: {
      enabled: !!address && enabled,
    },
  }) as { data: bigint | undefined; isFetching: boolean; isFetched: boolean };

  return { data, isFetching, isFetched };
};
