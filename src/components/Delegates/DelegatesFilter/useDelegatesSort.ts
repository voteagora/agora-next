import { useRouter, useSearchParams } from "next/navigation";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { delegatesFilterOptions } from "@/lib/constants";

export const useDelegatesSort = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const { setIsDelegatesFiltering } = useAgoraContext();

  // Get current sort from URL
  const orderByParam = searchParams?.get("orderBy") || "weighted_random";

  // Handle sort change
  const handleSortChange = (value: string) => {
    setIsDelegatesFiltering(true);
    router.push(
      value === delegatesFilterOptions.weightedRandom.sort
        ? deleteSearchParam({ name: "orderBy" })
        : addSearchParam({ name: "orderBy", value }),
      { scroll: false }
    );
  };

  // Reset sort
  const resetSort = () => {
    setIsDelegatesFiltering(true);
    router.push(deleteSearchParam({ name: "orderBy" }), { scroll: false });
  };

  return {
    orderByParam,
    handleSortChange,
    resetSort,
  };
};
