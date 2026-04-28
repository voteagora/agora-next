import { redirect } from "next/navigation";

export default function ExecutionTxIndexPage({
  params,
}: {
  params: { txHash: string };
}) {
  redirect(`/execution/tx/${params.txHash}/events`);
}
