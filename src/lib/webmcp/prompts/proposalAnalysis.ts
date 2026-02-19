import type { PromptDefinition } from "../types";

export function createProposalAnalysisPrompt(
  baseUrl: string,
  daoName: string
): PromptDefinition {
  return {
    name: "proposal-analysis",
    description: `Analyze a ${daoName} governance proposal in detail: summarize it, break down votes, check quorum status, and provide a recommendation.`,
    arguments: [
      {
        name: "proposalId",
        description: "The proposal ID to analyze",
        required: true,
      },
    ],
    handler: async (args) => {
      const proposalId = args.proposalId;

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: [
                `Analyze ${daoName} governance proposal \`${proposalId}\` in detail.`,
                "",
                "Use the available tools to:",
                "1. Fetch the proposal details with `get_proposals`",
                "2. Get the vote breakdown with `get_proposal_votes`",
                "3. Check the DAO overview with the `dao-overview` resource for votable supply context",
                "",
                "Then provide:",
                "- **Summary**: What does the proposal do?",
                "- **Vote Breakdown**: For / Against / Abstain totals and key voters",
                "- **Quorum Status**: Is quorum likely to be met?",
                "- **Timeline**: When does voting end?",
                "- **Key Observations**: Any notable patterns in voting",
              ].join("\n"),
            },
          },
        ],
      };
    },
  };
}
