"use client";

import { useLocation } from "@tanstack/react-router";
import { useCallback } from "react";

export const useDeleteSearchParam = () => {
  const location = useLocation();

  return useCallback(
    ({ name, clean }: { name: string; clean?: boolean }) => {
      const params = new URLSearchParams(
        clean ? undefined : location.searchStr
      );
      params.delete(name);
      return location.pathname + "?" + params.toString();
    },
    [location]
  );
};
