import { ExecutionEventsView } from "@/components/Execution/ExecutionEventsView";

export const dynamic = "force-dynamic";

export default function ExecutionEventsPage({
  params,
}: {
  params: { txHash: string };
}) {
  return <ExecutionEventsView txHash={params.txHash} />;
}
