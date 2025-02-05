"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAddSearchParam, useDeleteSearchParam } from "@/hooks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import FilterListbox from "@/components/common/FilterListbox";

const FILTER_PARAM = "delegatorFilter";
const DEFAULT_FILTER = "all_delegates";

export default function DelegatorFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addSearchParam = useAddSearchParam();
  const deleteSearchParam = useDeleteSearchParam();
  const { setIsDelegatesFiltering } = useAgoraContext();
  const { address } = useAccount();

  const currentParam = searchParams?.get(FILTER_PARAM);
  const filterParam = currentParam ? "my_delegates" : "all_delegates";

  const delegateeFilterOptions = [
    {
      value: "All delegates",
      sort: "all_delegates",
    },
    {
      value: "My delegates",
      sort: "my_delegates",
    },
  ];

  const handleChange = (value: string) => {
    setIsDelegatesFiltering(true);
    router.push(
      value === DEFAULT_FILTER
        ? deleteSearchParam({ name: FILTER_PARAM })
        : addSearchParam({ name: FILTER_PARAM, value: address || "" }),
      { scroll: false }
    );
  };

  if (!address) return null;

  return (
    <FilterListbox
      value={filterParam}
      onChange={handleChange}
      options={delegateeFilterOptions}
    />
  );
}
