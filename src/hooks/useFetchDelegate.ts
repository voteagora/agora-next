"use client";

import { useQuery } from "@tanstack/react-query";
import AgoraAPI from "@/app/lib/agoraAPI";

const useFetchDelegate = (address: string) => {
  const api = new AgoraAPI();
  return useQuery({
    enabled: !!address,
    queryKey: ['useFetchDelegate', address],
    queryFn: async () => {
      return await api.get(`/delegates/${address}`);
    }
  });
};

export default useFetchDelegate;