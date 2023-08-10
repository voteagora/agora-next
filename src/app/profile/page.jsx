"use client";
import { useState, useEffect } from "react";
import AgoraAPI from "../lib/agoraAPI";
import { useAccount } from "wagmi";
import Link from "next/link";

export default async function Page() {
  const { address } = useAccount();
  const [delegateStatement, setDelegateStatement] = useState(null);
  const isAuthenticated = Boolean(address);

  useEffect(() => {
    async function fetchDelegateStatement() {
      if (address) {
        const api = new AgoraAPI();
        const data = await api.get(`/statement/${address}`);
        setDelegateStatement(data);
      }
    }
    fetchDelegateStatement();
  }, [address]);

  return (
    <>
      <section>
        <h1>Profile</h1>
      </section>
      {isAuthenticated && delegateStatement != {} ? (
        <>
          <p>Delegate statement goes here</p>
          <Link href="/profile/edit">Edit your delegate statement</Link>
        </>
      ) : (
        <div>
          <Link href="/profile/create">Create a delegate statement</Link>
        </div>
      )}
    </>
  );
}
