import AdminForm from "@/components/Admin/AdminForm";
import { getVotableSupply } from "../api/votableSupply/getVotableSupply";

async function fetchVotableSupply() {
  "use server";

  return getVotableSupply();
}

export default async function Page() {
  const votableSupply = await fetchVotableSupply();

  return <AdminForm votableSupply={votableSupply} />;
}
