"use client";

import { useLocation } from "@tanstack/react-router";
import { useCallback } from "react";

export const useAddSearchParam = () => {
  const location = useLocation();

  return useCallback(
    ({
      name,
      value,
      clean,
    }: {
      name: string;
      value: string;
      clean?: boolean;
    }) => {
      const params = new URLSearchParams(
        clean ? undefined : location.searchStr
      );
      params.set(name, value);
      return location.pathname + "?" + params.toString();
    },
    [location]
  );
};
