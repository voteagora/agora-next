"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export const useDeleteSearchParam = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return useCallback(
    ({
      name,
      names,
      clean,
    }: {
      name?: string;
      names?: string[];
      clean?: boolean;
    }) => {
      const params = new URLSearchParams(
        clean ? undefined : searchParams?.toString()
      );

      // Delete a single parameter if provided
      if (name) {
        params.delete(name);
      }

      // Delete multiple parameters if provided
      if (names && names.length > 0) {
        names.forEach((paramName) => {
          params.delete(paramName);
        });
      }

      return pathname + "?" + params.toString();
    },
    [searchParams, pathname]
  );
};
