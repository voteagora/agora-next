import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import AgoraAPI from "@/app/lib/agoraAPI";

async function getProposal(proposal_id) {
  const api = new AgoraAPI();
  const data = await api.get(`/proposals/${proposal_id}`);
  return data.proposal;
}

function formatMarkdown(markdownText) {
  return markdownText.replace(/\\n/g, "\n");
}

// TODO: Load as a serverside component
export default function ProposalDescription({ proposal_id }) {
  const [proposal, setProposal] = useState({ description: "Loading..." });

  const formattedDescription = formatMarkdown(proposal.description);

  useEffect(() => {
    getProposal(proposal_id)
      .then((proposal) => {
        setProposal(proposal);
      })
      .catch((error) => {
        console.error("Failed to fetch proposal", error);
      });
  }, [proposal_id]);

  return (
    <>
      <div>{proposal.proposalData}</div>
      <div className="agora_markdown">
        {formattedDescription.split("\n").map((line, index) => {
          if (index === 0) {
            // First line is the title
            return <ReactMarkdown key={index}>{line}</ReactMarkdown>;
          } else {
            // Rest of the lines are markdown content
            return <ReactMarkdown key={index}>{line}</ReactMarkdown>;
          }
        })}
      </div>
    </>
  );
}
