import { fetchConnectedDelegate, } from "@/app/delegates/actions";
import { useAccount } from "wagmi";
import { useQuery } from '@tanstack/react-query';

const useConnectedDelegate = () => {
  const { address } = useAccount();

  const data = useQuery({
    enabled: !!address,
    queryKey: ['fetchConnectedDelegate', address],
    queryFn: async () => await fetchConnectedDelegate(address as `0x${string}`)
  });

  return { delegate: data?.data?.[0], advancedDelegators: data?.data?.[1], balance: data?.data?.[2] };
};

export default useConnectedDelegate;
