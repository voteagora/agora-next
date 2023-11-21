import ReactMarkdown from "react-markdown";

export default function ProposalDescription({ proposal }) {
  const formattedDescription = proposal.description?.replace(/\\n/g, "\n");

  return (
    <>
      <div className="agora_markdown">
        <ReactMarkdown>{formattedDescription}</ReactMarkdown>
      </div>
    </>
  );
}
