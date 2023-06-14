import ProposalsList from "./components/ProposalsList"

async function getProposals() {
  const res = await fetch("http://localhost:8000/api/v1/proposals", {
    method: "GET",
    headers: {
      "agora-api-key": process.env.AGORA_API_KEY!
    },
    cache: "no-store"
  })
  if (!res.ok) {
    throw new Error(res.statusText)
  }
  return res.json()
}

export default async function Page() {
  const proposals = await getProposals()

  return (
    <section>
      <h1>Proposals</h1>
      <ProposalsList list={proposals} />
    </section>
  )
}
