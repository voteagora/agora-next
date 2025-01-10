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
  const enabled = Boolean(scwConfig?.factoryAddress && owner !== undefined);
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
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

  if (!scwConfig?.factoryAddress) {
    return { data: undefined, enabled, isFetching: false, isFetched: false };
  }

  return { data, enabled, isFetching, isFetched };
};
