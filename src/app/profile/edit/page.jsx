"use client";

import DelegateStatementForm from "@/components/DelegateStatements/DelegateStatementForm";
import { useAccount } from "wagmi";

export default async function Page() {
  const { address } = useAccount();
  const isAuthenticated = Boolean(address);

  return (
    <>
      <section>
        <h1>Edit your delegate statement</h1>
      </section>
      {isAuthenticated ? (
        <DelegateStatementForm address={address} />
      ) : (
        <div>
          <p>Hmm... something went wrong.</p>
        </div>
      )}
    </>
  );
}
