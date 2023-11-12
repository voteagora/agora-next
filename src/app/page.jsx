import ProposalsList from "@/components/Proposals/ProposalsList";
import AgoraAPI from "./lib/agoraAPI";
import DAOMetricsHeader from "@/components/Metrics/DAOMetricsHeader";

async function fetchProposals(page = 1) {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(`/proposals?page=${page}`);
  return { proposals: data.proposals, meta: data.meta };
}

export default async function Home() {
  const proposals = await fetchProposals();

  return (
    <>
      <DAOMetricsHeader />
      <section className="mt-10">
        <h1 className="pageTitle">Proposals</h1>
        <ProposalsList
          initialProposals={proposals}
          fetchProposals={fetchProposals}
        />
      </section>
    </>
  );
}
