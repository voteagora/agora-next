"use client";

import { useQuery } from "@tanstack/react-query";

const useFetchDelegate = (address: string) => {
  return useQuery({
    enabled: !!address,
    queryKey: ['useFetchDelegate', address],
    queryFn: async () => {
      const res = await fetch(`/api/v1/delegates/${address}`);
      return res.json();
    }
  });
};

export default useFetchDelegate;