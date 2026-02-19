import type { PromptDefinition } from "../types";

export function createDelegateComparisonPrompt(
  daoName: string
): PromptDefinition {
  return {
    name: "delegate-comparison",
    description: `Compare two ${daoName} delegates by voting power, participation rate, governance statement, and social presence.`,
    arguments: [
      {
        name: "addressA",
        description: "First delegate address or ENS name",
        required: true,
      },
      {
        name: "addressB",
        description: "Second delegate address or ENS name",
        required: true,
      },
    ],
    handler: async (args) => {
      const { addressA, addressB } = args;

      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: [
                `Compare these two ${daoName} delegates side by side:`,
                `- Delegate A: \`${addressA}\``,
                `- Delegate B: \`${addressB}\``,
                "",
                "Use the available tools to:",
                "1. Fetch both delegates with `get_delegate`",
                "2. Get their voting power with `get_voting_power`",
                "3. Get their statements with `get_delegate_statement`",
                "",
                "Then present a comparison table covering:",
                "- **Voting Power**: Who has more and by how much?",
                "- **Delegators**: Number of delegators",
                "- **Participation Rate**: Who votes more consistently?",
                "- **Statement**: Summary of each delegate's position",
                "- **Social Presence**: Twitter, Discord, Warpcast",
                "- **Recommendation**: Which delegate is more active/aligned?",
              ].join("\n"),
            },
          },
        ],
      };
    },
  };
}
