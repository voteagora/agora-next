"use client";

import { useQuery } from "@tanstack/react-query";

const fetchMetrics = async () => {
  try {
    const response = await fetch(`/api/common/metrics`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetchMetrics:", error);
    throw error;
  }
};

export function useDAOMetrics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["daoMetrics"],
    queryFn: fetchMetrics,
    cacheTime: 300,
    refetchOnWindowFocus: true,
    initialData: {
      votableSupply: "0",
      totalSupply: "0",
    },
  });

  return {
    ...data,
    isLoading,
    error,
  };
}
