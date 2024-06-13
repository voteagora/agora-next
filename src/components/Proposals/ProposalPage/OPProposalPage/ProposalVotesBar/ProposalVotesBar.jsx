export default function ProposalVotesBar({ proposal, votes }) {
  const thresholdPercent = Math.round(Number(proposal.approvalThreshold) / 100);
  const voteCounts = {
    FOR: [],
    ABSTAIN: [],
    AGAINST: [],
  };

  votes.forEach((item) => {
    voteCounts[item.support].push(item);
  });

  return (
    <div id="chartContainer" className="relative flex items-stretch gap-x-0.5">
      {Object.entries(voteCounts).map(([support, parsedVotes], index) => (
        <div
          key={support} // use support as a unique key
          style={{
            flex: `${proposal.proposalResults[support.toLowerCase()]} 1 0%`,
          }}
          className="flex items-stretch gap-x-0.5 min-h-[10px]"
        >
          {parsedVotes?.map((vote, idx) => (
            <div
              key={`${support}-${idx}`} // use a combination of support and idx as a unique key
              style={{ flex: `${vote.weight} 1 0%` }}
              className={`min-w-[1px] ${support === "FOR" ? "bg-[#41b579]" : support === "AGAINST" ? "bg-[#db5664]" : "bg-[#666666]"}`}
            ></div>
          ))}
        </div>
      ))}

      <div
        className="bg-[#000000] h-4 w-[2px] absolute -top-[3px] z-50"
        style={{ left: `${thresholdPercent}%` }}
      />
    </div>
  );
}
