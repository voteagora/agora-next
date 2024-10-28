import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { getPublicClient } from "@/lib/viem";
import LightAccountFactory from "@/lib/contracts/abis/LightAccountFactory";
import { Address } from "viem";

export const SCW_QK = "smartAccountAddress";

interface Props {
  owner: `0x${string}` | undefined;
  salt: number;
}

export const useSmartAccountAddress = ({ owner, salt }: Props) => {
  const { ui, contracts } = Tenant.current();
  const scwConfig = ui.smartAccountConfig;

  console.log("SCW Lookup ", Boolean(scwConfig && owner));

  const client = getPublicClient(contracts.governor.chain.id);

  const { data, isFetching, isFetched } = useQuery({
    enabled: Boolean(scwConfig && owner),
    queryKey: [SCW_QK, owner],
    queryFn: async () => {
      const address = (await client.readContract({
        abi: LightAccountFactory,
        address: scwConfig.factoryAddress,
        functionName: "getAddress",
        args: [owner, salt],
      })) as Address;

      return address as Address;
    },
  });

  return { data, isFetching, isFetched };
};
