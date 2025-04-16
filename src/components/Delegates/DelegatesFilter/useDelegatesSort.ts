import { useQueryState } from "nuqs";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { delegatesFilterOptions } from "@/lib/constants";

export const useDelegatesSort = () => {
  const { setIsDelegatesFiltering } = useAgoraContext();

  const [orderByParam, setOrderByParam] = useQueryState("orderBy", {
    defaultValue: delegatesFilterOptions.weightedRandom.sort,
    clearOnDefault: true,
  });

  const handleSortChange = (value: string) => {
    setIsDelegatesFiltering(true);
    setOrderByParam(
      value === delegatesFilterOptions.weightedRandom.sort ? null : value,
      { scroll: false, shallow: false }
    );
  };

  const resetSort = () => {
    setIsDelegatesFiltering(true);
    setOrderByParam(null, { scroll: false, shallow: false });
  };

  return {
    orderByParam,
    handleSortChange,
    resetSort,
  };
};
