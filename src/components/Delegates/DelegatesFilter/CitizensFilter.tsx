"use client";

import { useSearchParams } from "next/navigation";
import { citizensFilterOptions } from "@/lib/constants";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useRouter } from "next/navigation";
import { useAgoraContext } from "@/contexts/AgoraContext";
import FilterListbox from "@/components/common/FilterListbox";

export default function CitizensFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const orderByParam = searchParams?.get("citizensOrderBy") || "shuffle";
  const { setIsDelegatesFiltering } = useAgoraContext();

  const handleChange = (value: string) => {
    setIsDelegatesFiltering(true);
    router.push(
      value !== "shuffle"
        ? addSearchParam({ name: "citizensOrderBy", value })
        : deleteSearchParam({ name: "citizensOrderBy" }),
      { scroll: false }
    );
  };

  return (
    <FilterListbox
      value={orderByParam}
      onChange={handleChange}
      options={citizensFilterOptions}
    />
  );
}
