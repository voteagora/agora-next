export function parseSnapshotProposalData(proposalData: string) {
  const parsedProposalData = JSON.parse(proposalData);

  return {
    key: "SNAPSHOT" as const,
    kind: {
      title: parsedProposalData.title ?? "",
      start_ts: parsedProposalData.start_ts ?? 0,
      end_ts: parsedProposalData.end_ts ?? 0,
      created_ts: parsedProposalData.created_ts ?? 0,
      link: parsedProposalData.link ?? "",
      scores: parsedProposalData.scores ?? [],
      type: parsedProposalData.type ?? "",
      votes: parsedProposalData.votes ?? "",
      state: parsedProposalData.state ?? "",
      body: parsedProposalData.body ?? "",
      choices: parsedProposalData.choices ?? [],
    },
  };
}
