import Image from "next/image"
import { Suspense } from "react"

import blinkGif from "../../../public/images/blink.gif"
import HumanAddress from "./components/HumanAddress"
import HumanVote from "./components/HumanVote"

async function getProposal(id: string) {
  const res = await fetch(`http://localhost:8000/api/v1/proposals/${id}`, {
    method: "GET",
    headers: {
      "agora-api-key": process.env.AGORA_API_KEY!
    }
  })
  if (!res.ok) {
    throw new Error(res.statusText)
  }
  return res.json()
}

async function getVotes(id: string) {
  const res = await fetch(
    `http://localhost:8000/api/v1/proposals/${id}/votes`,
    {
      method: "GET",
      headers: {
        "agora-api-key": process.env.AGORA_API_KEY!
      }
    }
  )
  if (!res.ok) {
    throw new Error(res.statusText)
  }
  return res.json()
}

export default async function Page({ params }: { params: { id: string } }) {
  const proposalData = getProposal(params.id)
  const votesData = getVotes(params.id)

  const proposal = await proposalData

  return (
    <section>
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
                  Loading... <br />
                  <Image src={blinkGif} alt="Blinging Agora Logo" />
                </div>
              }
            >
              <ProposalVotes promise={votesData} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}

type ProposalVotesProps = {
  promise: Promise<any>
}

// ProposalVotes Component
async function ProposalVotes({ promise }: ProposalVotesProps) {
  // Wait for the proposal promise to resolve
  const votes: any[] = await promise

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
  )
}
