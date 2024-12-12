import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  address: `0x${string}` | undefined;
  enabled: boolean;
}

export const NONCE_QK = "nonce";

export const useNonce = ({ address, enabled }: Props) => {
  const { contracts } = Tenant.current();

  const { data, isFetching, isFetched } = useQuery({
    queryKey: [NONCE_QK, address],
    queryFn: async () => {
      return await contracts.token.contract.nonces!(address!);
    },
    enabled: enabled && !!address,
  });

  return { data, isFetching, isFetched };
};
