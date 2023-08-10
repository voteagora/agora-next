"use client"
import AgoraAPI from "../lib/agoraAPI";
import { useAccount } from "wagmi";
import Link from "next/link";

async function fetchDelegateStatement(address) {
  const api = new AgoraAPI();
  const data = await api.get(`/statement/${address}`);
  console.log(data);
  return { data };
}

export default async function Page() {
  const { address } = useAccount();
  const isAuthenticated = Boolean(address);
  console.log(address);
  // const delegateStatement = await fetchDelegateStatement(address);

  return (
    <>
      <section>
        <h1>Profile</h1>
      </section>
      {isAuthenticated && delegateStatement ? (
        <>
          <p>Delegate statement goes here</p>
          <Link href="/profile/edit">Edit your delegate statement</Link>
        </>
      ) : (
        <div>
          <h1>Create a delegate statement</h1>
          <Link href="/profile/create">Create a delegate statement</Link>
        </div>
      )}
    </>
  );
}
