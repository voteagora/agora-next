"use client";

import { useEffect, useRef } from "react";
import { initWebMCP } from "@/lib/webmcp";
import Tenant from "@/lib/tenant/tenant";

const WEBMCP_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/@anthropic-ai/webmcp@latest/dist/webmcp.min.js";

const WEBMCP_FALLBACK_URL =
  "https://unpkg.com/@anthropic-ai/webmcp@latest/dist/webmcp.min.js";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export default function WebMcpProvider() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const { namespace, brandName, token, contracts, ui } = Tenant.current();

    async function bootstrap() {
      try {
        try {
          await loadScript(WEBMCP_SCRIPT_URL);
        } catch {
          await loadScript(WEBMCP_FALLBACK_URL);
        }
      } catch {
        console.warn("[WebMCP] Could not load WebMCP script. Skipping.");
        return;
      }

      // Small delay to let the script initialize the global
      await new Promise((r) => setTimeout(r, 100));

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
      });
    }

    bootstrap();
  }, []);

  return null;
}
