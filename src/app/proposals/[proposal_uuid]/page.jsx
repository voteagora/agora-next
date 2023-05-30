import { Suspense } from "react";
import styles from "./styles.module.scss";
import HumanAddress from "@/components/shared/HumanAddress";
import HumanVote from "@/components/shared/HumanVote";
import Image from "next/image";

async function getProposal(proposal_uuid) {
  const res = await fetch(
    `http://localhost:8000/api/v1/proposals/${proposal_uuid}`,
    {
      method: "GET",
      headers: {
        "agora-api-key": process.env.AGORA_API_KEY,
      },
    }
  );
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
}

async function getVotes(proposal_uuid) {
  const res = await fetch(
    `http://localhost:8000/api/v1/proposals/${proposal_uuid}/votes`,
    {
      method: "GET",
      headers: {
        "agora-api-key": process.env.AGORA_API_KEY,
      },
    }
  );
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  return res.json();
}

export default async function Page({ params: { proposal_uuid } }) {
  const proposalData = getProposal(proposal_uuid);
  const votesData = getVotes(proposal_uuid);

  const proposal = await proposalData;

  return (
    <section className={styles.proposal_show}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 grid-rows-1 items-start gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div className="-mx-4 px-4 py-8 shadow-sm ring-1 ring-gray-900/5 sm:mx-0 sm:rounded-lg sm:px-8 sm:pb-14 lg:col-span-2 lg:row-span-2 lg:row-end-2 xl:px-16 xl:pb-20 xl:pt-16">
            <h3>A {proposal.token} proposal</h3>
            <h1>{proposal.uuid}</h1>
            <div>{proposal.description}</div>
          </div>
          <div className="lg:col-start-3 lg:row-end-1">
            <h1>Votes</h1>
            <Suspense
              fallback={
                <div>
                  Loading...{" "}
                  <br/>
                  <Image
                    src="/images/blink.gif"
                    alt="Blinging Agora Logo"
                    width={50}
                    height={20}
                  />
                </div>
              }
            >
              <ProposalVotes promise={votesData} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

// ProposalVotes Component
async function ProposalVotes({ promise }) {
  // Wait for the proposal promise to resolve
  const votes = await promise;

  return (
    <ul>
      {votes.map((vote) => (
        <li key={vote.id}>
          <p>
            <HumanAddress address={vote.address} /> voted{" "}
            <HumanVote support={vote.support} />
          </p>
        </li>
      ))}
    </ul>
  );
}
