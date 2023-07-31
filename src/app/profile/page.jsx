import DelegateStatementForm from "@/components/DelegateStatements/DelegateStatementForm";
import AgoraAPI from "../lib/agoraAPI";
import { useAccount } from "wagmi";

async function fetchStatement(page = 1) {
  "use server";

  const api = new AgoraAPI();
  const statement = await api.get(`/statement`);
  return { proposals: data.proposals, meta: data.meta };
}

export default async function Page() {
  const { address } = useAccount();
  const isAuthenticated = Boolean(address);

  return (
    <>
      <section>
        <h1>Profile</h1>
      </section>
      {isAuthenticated ? (
        <DelegateStatementForm />
      ) : (
        <div>
          <h1>Your profile goes here!</h1>
          
        </div>
      )}
    </>
  );
}
