"use client";

import { useEffect, useState } from "react";
import AgoraAPI from "@/app/lib/agoraAPI";

async function getProposalResults(proposal_id) {
  const api = new AgoraAPI();
  const data = await api.get(`/proposals/${proposal_id}/results`);
  return data;
}

export default function ProposalResults({ proposal_id }) {
  const [results, setResults] = useState("Loading...");

  useEffect(() => {
    getProposalResults(proposal_id)
      .then((results) => {
        setResults(results);
      })
      .catch((error) => {
        console.error("Failed to fetch proposal resutls", error);
      });
  }, [proposal_id]);

  switch (results.proposalType) {
    case "STANDARD":
      return <div>{JSON.stringify(results.results.standard)}</div>;
    case "APPROVAL":
      return (
        <>
          <div>{JSON.stringify(results.results.approval)}</div>
          <div>{JSON.stringify(results.results.standard)}</div>
          <div>Quorum: {results.quorum}</div>
        </>
      );
  }
}
