"use client";

import DelegateStatementForm from "@/components/DelegateStatements/DelegateStatementForm";
import { useAccount } from "wagmi";

async function fetchDelegateStaement(address) {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(`/statement?address=${address}`);
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
        <DelegateStatementForm address={address} />
      ) : (
        <div>
          <h1>Your profile goes here!</h1>
          
        </div>
      )}
    </>
  );
}
