"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { draftProposalsFilterOptions } from "@/lib/constants";
import action from "./action";

const useDraftProposals = ({
  address,
  filter,
}: {
  address?: `0x${string}`;
  filter: string;
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  // required for fixing the strange error where the query pends forever on first load if filter contains value
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["draftProposals", filter, address],
    queryFn: () => {
      const ownerOnly = filter === draftProposalsFilterOptions.myDrafts.filter;
      return action(address, ownerOnly);
    },
    enabled: hasMounted,
  });

  return { data, isLoading, error };
};

export default useDraftProposals;
