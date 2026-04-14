"use client";

import { PropsWithChildren, useEffect } from "react";

import { configureMiradorWebClient } from "@/lib/mirador/webClient";

type MiradorProviderProps = PropsWithChildren<{
  apiKey?: string;
  enabled?: boolean;
}>;

export function MiradorProvider({
  apiKey,
  enabled = false,
  children,
}: MiradorProviderProps) {
  useEffect(() => {
    configureMiradorWebClient({ apiKey, enabled });
  }, [apiKey, enabled]);

  return <>{children}</>;
}
