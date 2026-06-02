import { ExecutionStateView } from "@/components/Execution/ExecutionStateView";

export const dynamic = "force-dynamic";

export default async function ExecutionStatePage(props: {
  params: Promise<{ txHash: string }>;
}) {
  const params = await props.params;
  return <ExecutionStateView txHash={params.txHash} />;
}
