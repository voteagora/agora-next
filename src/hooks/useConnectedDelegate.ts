import { fetchConnectedDelegate } from "@/app/delegates/actions";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";

const useConnectedDelegate = () => {
  const { address } = useAccount();

  const data = useQuery({
    enabled: !!address,
    queryKey: ["useConnectedDelegate", address],
    queryFn: async () => {
      const [delegate, advancedDelegators, balance] =
        await fetchConnectedDelegate(address!);
      return { delegate, advancedDelegators, balance };
    },
  });

  return data.data
    ? {
        ...data.data,
        isLoading: data.isLoading,
      }
    : {
        balance: null,
        delegate: null,
        advancedDelegators: null,
        isLoading: data.isLoading,
      };
};

export default useConnectedDelegate;
