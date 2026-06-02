import { ExecutionTxShell } from "@/components/Execution/ExecutionTxShell";

export const dynamic = "force-dynamic";

export default async function ExecutionTxLayout(props: {
  children: React.ReactNode;
  params: Promise<{ txHash: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  return <ExecutionTxShell txHash={params.txHash}>{children}</ExecutionTxShell>;
}
