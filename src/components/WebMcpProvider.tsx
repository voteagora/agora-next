"use client";

import { useEffect, useRef } from "react";
import { initWebMCP } from "@/lib/webmcp";
import Tenant from "@/lib/tenant/tenant";

export default function WebMcpProvider() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const { namespace, brandName, token, contracts, ui } = Tenant.current();

    initWebMCP({
      namespace,
      brandName,
      tokenSymbol: token.symbol,
      hasStaker: contracts.staker !== undefined,
      toggles: {
        grants: ui.toggle("grants")?.enabled ?? false,
        forums: ui.toggle("forums")?.enabled ?? false,
        retropgf: ui.toggle("retropgf")?.enabled ?? false,
      },
    }).catch((err) => {
      console.error("[WebMCP] Provider initialization error:", err);
    });
  }, []);

  return null;
}
