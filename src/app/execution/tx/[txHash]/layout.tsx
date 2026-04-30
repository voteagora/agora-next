import { ExecutionTxShell } from "@/components/Execution/ExecutionTxShell";

export const dynamic = "force-dynamic";

export default function ExecutionTxLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { txHash: string };
}) {
  return <ExecutionTxShell txHash={params.txHash}>{children}</ExecutionTxShell>;
}
