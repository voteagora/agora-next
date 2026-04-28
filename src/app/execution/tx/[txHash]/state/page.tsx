import { ExecutionStateView } from "@/components/Execution/ExecutionStateView";

export const dynamic = "force-dynamic";

export default function ExecutionStatePage({
  params,
}: {
  params: { txHash: string };
}) {
  return <ExecutionStateView txHash={params.txHash} />;
}
