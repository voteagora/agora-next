import { ExecutionEventsView } from "@/components/Execution/ExecutionEventsView";

export const dynamic = "force-dynamic";

export default async function ExecutionEventsPage(props: {
  params: Promise<{ txHash: string }>;
}) {
  const params = await props.params;
  return <ExecutionEventsView txHash={params.txHash} />;
}
