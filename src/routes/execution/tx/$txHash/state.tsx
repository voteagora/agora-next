/*
 * TanStack Start port of src/app/execution/tx/[txHash]/state/page.tsx.
 * URL: /execution/tx/:txHash/state
 */

import { createFileRoute } from "@tanstack/react-router";

import { ExecutionStateView } from "@/components/Execution/ExecutionStateView";

export const Route = createFileRoute("/execution/tx/$txHash/state")({
  component: function ExecutionStatePage() {
    const { txHash } = Route.useParams();
    return <ExecutionStateView txHash={txHash} />;
  },
});
