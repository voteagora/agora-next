"use client";

import DelegateStatementForm from "@/components/DelegateStatements/DelegateStatementForm";
import { useAccount } from "wagmi";

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
