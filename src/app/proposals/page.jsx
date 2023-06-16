"use client";

import { ProposalsList } from "../../components/Proposals/ProposalsList";
import AgoraAPI from "../lib/agoraAPI";
import React from "react";

async function getProposals(page = 1) {
  const api = new AgoraAPI();
  const data = await api.get(`/proposals?page=${page}`);
  return { proposals: data.proposals, meta: data.meta };
}

export default function Page() {
  // Set up state for proposals and meta
  const [proposals, setProposals] = React.useState([]);
  const [meta, setMeta] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    getProposals([currentPage]).then(({ proposals, meta }) => {
      setProposals(proposals);
      setMeta(meta);
    });
  }, [currentPage, proposals]);

  const goToNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage(currentPage > 1 ? currentPage - 1 : 1);
  };

  return (
    <section>
      <h1>Proposals {proposals.length}</h1>
      <ProposalsList list={proposals} />
      <button onClick={goToPreviousPage} disabled={currentPage === 1}>
        Previous Page
      </button>
      <button
        onClick={goToNextPage}
        disabled={currentPage === meta.total_pages}
      >
        Next Page
      </button>
    </section>
  );
}
