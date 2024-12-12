import { useQuery } from "@tanstack/react-query";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";

interface Props {
  address: `0x${string}` | undefined;
  contract: ITokenContract;
  enabled: boolean;
}

export const NONCE_QK = "nonce";

export const useNonce = ({ address, contract, enabled }: Props) => {

  const { data, isFetching, isFetched } = useQuery({
    queryKey: [NONCE_QK, address],
    queryFn: async () => {
      return await contract.nonces!(address!);
    },
    enabled: enabled && !!address,
  });

  return { data, isFetching, isFetched };
};
