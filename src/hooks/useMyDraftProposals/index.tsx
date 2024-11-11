"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import action from "./action";

const useMyDraftProposals = ({ address }: { address?: `0x${string}` }) => {
  const [hasMounted, setHasMounted] = useState(false);

  // required for fixing the strange error where the query pends forever on first load if filter contains value
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["myDraftProposals", address],
    queryFn: () => {
      return action(address);
    },
    enabled: hasMounted,
  });

  return { data, isLoading, error };
};

export default useMyDraftProposals;
