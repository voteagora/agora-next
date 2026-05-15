/*
 * TanStack Start port of src/app/execution/tx/[txHash]/events/page.tsx.
 * URL: /execution/tx/:txHash/events
 */

import { createFileRoute } from "@tanstack/react-router";

import { ExecutionEventsView } from "@/components/Execution/ExecutionEventsView";

export const Route = createFileRoute("/execution/tx/$txHash/events")({
  component: function ExecutionEventsPage() {
    const { txHash } = Route.useParams();
    return <ExecutionEventsView txHash={txHash} />;
  },
});
