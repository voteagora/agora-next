import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { getPublicClient } from "@/lib/viem";
import { LightAccountFactoryABI } from "@/lib/contracts/abis/LightAccountFactory";
import { Address } from "viem";

export const SCW_QK = "smartAccountAddress";

interface Props {
  owner: `0x${string}` | undefined;
}

export const useSmartAccountAddress = ({ owner }: Props) => {
  const { ui, contracts } = Tenant.current();
  const scwConfig = ui.smartAccountConfig;

  const client = getPublicClient(contracts.governor.chain.id);

  const { data, isFetching, isFetched } = useQuery({
    enabled: Boolean(scwConfig?.factoryAddress && owner !== undefined),
    queryKey: [SCW_QK, owner],
    queryFn: async () => {
      return (await client.readContract({
        abi: LightAccountFactoryABI,
        address: scwConfig!.factoryAddress,
        functionName: "getAddress",
        args: [owner, scwConfig?.salt],
      })) as Address;
    },
  });

  return { data, isFetching, isFetched };
};
