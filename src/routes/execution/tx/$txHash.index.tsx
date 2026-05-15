/*
 * TanStack Start port of src/app/execution/tx/[txHash]/page.tsx.
 *
 * Demonstrates the smallest possible page conversion:
 *   - bracket params `[txHash]` → `$txHash`
 *   - `redirect()` from `next/navigation` → `redirect()` from `@tanstack/react-router`
 *
 * URL: GET /execution/tx/:txHash  → redirects to /execution/tx/:txHash/events
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/execution/tx/$txHash/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/execution/tx/$txHash/events",
      params: { txHash: params.txHash },
    });
  },
});
