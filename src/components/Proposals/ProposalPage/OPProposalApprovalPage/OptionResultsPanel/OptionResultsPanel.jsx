import AgoraAPI from "@/app/lib/agoraAPI";

export default function OptionsResultsPanel({ proposal, proposalResults }) {
  return (
    <div>
      <p>{proposalResults.proposalType}</p>
      <p>{proposalResults.quorum}</p>
      <p>{proposal.description}</p>
    </div>
  );
}
