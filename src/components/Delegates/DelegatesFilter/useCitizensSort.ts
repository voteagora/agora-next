import { useQueryState } from "nuqs";
import { useAgoraContext } from "@/contexts/AgoraContext";

export const useCitizensSort = () => {
  const { setIsDelegatesFiltering } = useAgoraContext();

  const [orderByParam, setOrderByParam] = useQueryState("citizensOrderBy", {
    defaultValue: "shuffle",
    clearOnDefault: true,
  });

  const handleSortChange = (value: string) => {
    setIsDelegatesFiltering(true);
    setOrderByParam(value === "shuffle" ? null : value, {
      scroll: false,
      shallow: false,
    });
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
