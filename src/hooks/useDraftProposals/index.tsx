import { useQuery } from "@tanstack/react-query";
import action from "./action";

const useDraftProposals = ({ address }: { address?: `0x${string}` }) => {
  console.log("address", address);
  const { data, isLoading, error, status, isFetching } = useQuery({
    queryKey: ["draftProposals", address],
    // queryFn: () => fetchDraftProposals(address!),
    queryFn: () => {
      console.log("fetching draft proposals");
      return action(address!);
    },
    enabled: !!address,
  });

  //   console.log("data", data);
  //   console.log("isLoading", isLoading);
  //   console.log("error", error);
  //   console.log("status", status);
  //   console.log("isFetching", isFetching);

  return { data, isLoading, error };
};

export default useDraftProposals;
