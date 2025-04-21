import { isAddress } from "viem";
import { keccak256, toUtf8Bytes } from "ethers";
import { cachedGetContractAbi } from "@/lib/abiUtils";
import Tenant from "@/lib/tenant/tenant";
import { useQuery } from "@tanstack/react-query";
import { getCanonicalType } from "@/lib/utils";

export function useContractAbi(address: string) {
  const { contracts } = Tenant.current();

  return useQuery({
    queryKey: ["contractAbi", address],
    queryFn: async () => {
      if (!address || !isAddress(address, { strict: false })) {
        return [];
      }

      const abi = await cachedGetContractAbi(
        address,
        process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || "",
        contracts.governor.chain.name
      );

      if (!abi) return [];

      return abi.map((item) => {
        const signature = `${item.name}(${item.inputs
          ?.map((input) => getCanonicalType(input))
          .join(",")})`;
        const selector = keccak256(toUtf8Bytes(signature)).slice(
          0,
          10
        ) as `0x${string}`;
        return {
          name: item.name || "",
          selector,
          inputs: item.inputs || [],
        };
      });
    },
    enabled: !!address && isAddress(address, { strict: false }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
