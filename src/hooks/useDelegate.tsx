import { useQuery } from "@tanstack/react-query";
import { fetchDelegate } from "@/app/delegates/actions";
import { Delegate } from "@/app/api/common/delegates/delegate";

export const DELEGATE_QK = "delegate";

interface Props {
  address: `0x${string}` | undefined;
}

export const useDelegate = ({ address }: Props) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: Boolean(address !== undefined),
    queryKey: [DELEGATE_QK, address],
    queryFn: async () => {
      return (await fetchDelegate(address as string)) as Delegate;
    },
  });

  return { data, isFetching, isFetched };
};
