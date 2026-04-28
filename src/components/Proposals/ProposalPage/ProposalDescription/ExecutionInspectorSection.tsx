import { ExecutionInspectorCard } from "@/components/Execution/ExecutionInspectorCard";

export function ExecutionInspectorSection({
  executedTransactionHash,
}: {
  executedTransactionHash?: string | null;
}) {
  if (!executedTransactionHash) {
    return null;
  }

  return (
    <ExecutionInspectorCard
      txHash={executedTransactionHash}
      variant="compact"
      className="mt-2"
    />
  );
}
