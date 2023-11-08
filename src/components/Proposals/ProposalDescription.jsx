import ReactMarkdown from "react-markdown";
import AgoraAPI from "@/app/lib/agoraAPI";

async function getProposal(proposal_id) {
  "use server";

  const api = new AgoraAPI();
  const data = await api.get(`/proposals/${proposal_id}`);
  return data.proposal;
}

function formatMarkdown(markdownText) {
  return markdownText.replace(/\\n/g, "\n");
}

export default async function ProposalDescription({ proposal_id }) {
  const proposal = await getProposal(proposal_id);
  const formattedDescription = formatMarkdown(proposal.description);

  return (
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
  );
}
