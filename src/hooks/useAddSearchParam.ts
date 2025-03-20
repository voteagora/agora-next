"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export const useAddSearchParam = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return useCallback(
    ({
      name,
      value,
      params,
      clean,
    }: {
      name?: string;
      value?: string;
      params?: Record<string, string>;
      clean?: boolean;
    }) => {
      const urlParams = new URLSearchParams(
        clean ? undefined : searchParams?.toString()
      );
      
      if (params) {
        // Add multiple parameters
        Object.entries(params).forEach(([key, val]) => {
          urlParams.set(key, val);
        });
      } else if (name && value) {
        // Add single parameter
        urlParams.set(name, value);
      }
      
      return pathname + "?" + urlParams.toString();
    },
    [searchParams, pathname]
  );
};
