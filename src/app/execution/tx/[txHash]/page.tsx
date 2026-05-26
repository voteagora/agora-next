import { redirect } from "next/navigation";

export default async function ExecutionTxIndexPage(props: {
  params: Promise<{ txHash: string }>;
}) {
  const params = await props.params;
  redirect(`/execution/tx/${params.txHash}/events`);
}
