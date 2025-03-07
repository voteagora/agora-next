import { useQuery } from "@tanstack/react-query";

interface Props {
  enabled: boolean;
}

const QK = "votableSupply";

export const useVotableSupply = ({ enabled }: Props) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [QK],
    queryFn: async () => {
      const response = await fetch(`/api/v1/votable_supply`);
      const data = await response.json();
      return data.votable_supply;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return { data, isFetching, isFetched, queryKey: QK };
};
