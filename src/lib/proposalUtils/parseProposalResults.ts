import {
  calculateHybridApprovalProposalMetrics,
  ParsedProposalData,
  ParsedProposalResults,
  getProposalCreatedTime,
} from "../proposalUtils";
import { ProposalType } from "../types";
import Tenant from "../tenant/tenant";
import { TENANT_NAMESPACES } from "../constants";

type ProposalResults = {
  standard: [string, string, string];
  approval: {
    param: string;
    votes: string;
  }[];
};

export function parseProposalResults(
  proposalResults: string,
  proposalData: ParsedProposalData[ProposalType],
  startBlock: string,
  offchainProposalData?: string,
  quorum?: number,
  createdTime?: Date | null
): ParsedProposalResults[ProposalType] {
  const type = proposalData.key;
  switch (type) {
    case "SNAPSHOT": {
      return {
        key: "SNAPSHOT",
        kind: {
          scores: JSON.parse(proposalResults).scores ?? [],
          status: proposalData.kind.state ?? "",
        },
      };
    }
    case "STANDARD":
    case "OPTIMISTIC":
    case "OFFCHAIN_STANDARD": {
      const parsedProposalResults = JSON.parse(proposalResults).standard;

      return {
        key: proposalData.key,
        kind: {
          for: BigInt(parsedProposalResults?.[1] ?? 0),
          against: BigInt(parsedProposalResults?.[0] ?? 0),
          abstain: BigInt(parsedProposalResults?.[2] ?? 0),
        },
      };
    }
    case "APPROVAL": {
      const parsedProposalResults = JSON.parse(
        proposalResults
      ) as ProposalResults;

      const { namespace, contracts } = Tenant.current();

      const standardResults = (() => {
        if (
          namespace === TENANT_NAMESPACES.OPTIMISM &&
          contracts.governor.v6UpgradeBlock &&
          Number(startBlock) < contracts.governor.v6UpgradeBlock
        ) {
          return {
            for: BigInt(parsedProposalResults.standard?.[0] ?? 0),
            against: 0n,
            abstain: BigInt(parsedProposalResults.standard?.[1] ?? 0),
          };
        }

        return {
          for: BigInt(parsedProposalResults.standard?.[1] ?? 0),
          against: BigInt(parsedProposalResults.standard?.[0] ?? 0),
          abstain: BigInt(parsedProposalResults.standard?.[2] ?? 0),
        };
      })();

      return {
        key: "APPROVAL",
        kind: {
          for: standardResults.for,
          abstain: standardResults.abstain,
          against: standardResults.against,
          options: proposalData.kind.options.map((option, idx) => {
            return {
              option: option.description,
              votes: BigInt(
                parsedProposalResults.approval?.find((res) => {
                  return res.param === idx.toString();
                })?.votes ?? 0
              ),
            };
          }),
          criteria: proposalData.kind.proposalSettings.criteria,
          criteriaValue: proposalData.kind.proposalSettings.criteriaValue,
        },
      };
    }
    case "OFFCHAIN_APPROVAL": {
      const parsedProposalResults = JSON.parse(
        proposalResults
      ) as ProposalResults;
      const standardResults = parsedProposalResults.standard;

      // Parse offchain data from offchainProposalData
      const offchainResults = parseOffChainProposalResults(
        offchainProposalData || "{}",
        "OFFCHAIN_APPROVAL"
      );

      const baseResult = {
        key: "OFFCHAIN_APPROVAL" as const,
        kind: {
          for: BigInt(standardResults?.[1] ?? 0),
          against: BigInt(standardResults?.[0] ?? 0),
          abstain: BigInt(standardResults?.[2] ?? 0),
          options: proposalData.kind.choices.map((choice) => ({
            option: choice,
            weightedPercentage: 0,
            isApproved: false,
          })),
        },
      };

      // Calculate weighted percentages and approval status if we have the necessary data
      if (quorum && createdTime) {
        try {
          const metrics = calculateHybridApprovalProposalMetrics({
            proposalResults: {
              ...baseResult.kind,
              ...offchainResults.kind,
              criteria: "THRESHOLD" as const,
              criteriaValue: 0n,
            },
            proposalData: proposalData.kind as any,
            quorum,
            createdTime,
          });

          baseResult.kind.options = baseResult.kind.options.map(
            (option: {
              option: string;
              weightedPercentage: number;
              isApproved: boolean;
            }) => {
              const optionMetrics = metrics.optionResults.find(
                (result) => result.optionName === option.option
              );
              return {
                option: option.option,
                weightedPercentage: optionMetrics?.weightedPercentage || 0,
                isApproved: optionMetrics?.meetsThreshold || false,
              };
            }
          );
        } catch (error) {
          // If calculation fails, keep default values
          console.warn("Failed to calculate OFFCHAIN_APPROVAL metrics:", error);
        }
      }

      return baseResult;
    }
    case "HYBRID_STANDARD": {
      // Parse onchain data (DELEGATES) from proposalResults
      const parsedProposalResults = JSON.parse(proposalResults).standard;
      const delegatesResults = {
        for: BigInt(parsedProposalResults?.[1] ?? 0),
        against: BigInt(parsedProposalResults?.[0] ?? 0),
        abstain: BigInt(parsedProposalResults?.[2] ?? 0),
      };

      // Parse offchain data from offchainProposalData
      const offchainResults = parseOffChainProposalResults(
        offchainProposalData || "{}",
        "HYBRID_STANDARD"
      );

      // Combine both results
      return {
        key: "HYBRID_STANDARD",
        kind: {
          ...offchainResults.kind,
          DELEGATES: delegatesResults,
          ...delegatesResults,
        },
      };
    }

    case "HYBRID_OPTIMISTIC": {
      // Parse onchain data (DELEGATES) from proposalResults
      const parsedProposalResults = JSON.parse(proposalResults).standard;
      const delegatesResults = {
        for: BigInt(parsedProposalResults?.[1] ?? 0),
        against: BigInt(parsedProposalResults?.[0] ?? 0),
        abstain: BigInt(parsedProposalResults?.[2] ?? 0),
      };

      // Parse offchain data from offchainProposalData
      const offchainResults = parseOffChainProposalResults(
        offchainProposalData || "{}",
        "HYBRID_OPTIMISTIC"
      );

      // Combine both results
      return {
        key: "HYBRID_OPTIMISTIC",
        kind: {
          ...offchainResults.kind,
          DELEGATES: delegatesResults,
        },
      };
    }
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED": {
      return parseOffChainProposalResults(
        proposalResults || "{}",
        proposalData.key
      );
    }
    case "HYBRID_OPTIMISTIC_TIERED": {
      // Parse onchain data (DELEGATES) from proposalResults
      const parsedProposalResults = JSON.parse(proposalResults).standard;
      const delegatesResults = {
        for: BigInt(parsedProposalResults?.[1] ?? 0),
        against: BigInt(parsedProposalResults?.[0] ?? 0),
        abstain: BigInt(parsedProposalResults?.[2] ?? 0),
      };

      // Parse offchain data from offchainProposalData
      const offchainResults = parseOffChainProposalResults(
        offchainProposalData || "{}",
        "HYBRID_OPTIMISTIC_TIERED"
      );

      // Combine both results
      return {
        key: "HYBRID_OPTIMISTIC_TIERED",
        kind: {
          ...offchainResults.kind,
          DELEGATES: delegatesResults,
          ...delegatesResults,
        },
      };
    }
    case "HYBRID_APPROVAL": {
      // Parse onchain data from proposalResults
      const parsedProposalResults = JSON.parse(
        proposalResults
      ) as ProposalResults;
      const { namespace, contracts } = Tenant.current();

      // Not sure whey we did this in APPROVAL,
      // Have to comeback and check this
      const standardResults = (() => {
        if (
          namespace === TENANT_NAMESPACES.OPTIMISM &&
          contracts.governor.v6UpgradeBlock &&
          Number(startBlock) < contracts.governor.v6UpgradeBlock
        ) {
          return {
            for: BigInt(parsedProposalResults.standard?.[0] ?? 0),
            against: 0n,
            abstain: BigInt(parsedProposalResults.standard?.[1] ?? 0),
          };
        }

        return {
          for: BigInt(parsedProposalResults.standard?.[1] ?? 0),
          against: BigInt(parsedProposalResults.standard?.[0] ?? 0),
          abstain: BigInt(parsedProposalResults.standard?.[2] ?? 0),
        };
      })();

      // Parse offchain data from offchainProposalData
      const offchainResults = parseOffChainProposalResults(
        offchainProposalData || "{}",
        "HYBRID_APPROVAL"
      );

      // Transform the DELEGATES data to match the same structure as other categories
      const delegatesOptions: Record<string, bigint> = {};
      proposalData.kind.options.forEach((option, idx) => {
        const optionName = option.description;
        const voteCount = BigInt(
          parsedProposalResults.approval?.find(
            (res) => res.param === idx.toString()
          )?.votes ?? 0
        );
        delegatesOptions[optionName] = voteCount;
      });

      const baseResult = {
        key: proposalData.key,
        kind: {
          ...offchainResults.kind,
          DELEGATES: delegatesOptions, // Use the transformed structure
          options: proposalData.kind.options.map((option) => ({
            option: option.description,
            weightedPercentage: 0,
            isApproved: false,
          })),
          criteria: proposalData.kind.proposalSettings.criteria,
          criteriaValue: proposalData.kind.proposalSettings.criteriaValue,
          ...standardResults,
        },
      };

      // Calculate weighted percentages and approval status if we have the necessary data
      if (quorum && createdTime) {
        try {
          const metrics = calculateHybridApprovalProposalMetrics({
            proposalResults: baseResult.kind,
            proposalData: proposalData.kind,
            quorum,
            createdTime,
          });

          baseResult.kind.options = baseResult.kind.options.map(
            (option: {
              option: string;
              weightedPercentage: number;
              isApproved: boolean;
            }) => {
              const optionMetrics = metrics.optionResults.find(
                (result) => result.optionName === option.option
              );
              return {
                option: option.option,
                weightedPercentage: optionMetrics?.weightedPercentage || 0,
                isApproved: optionMetrics?.meetsThreshold || false,
              };
            }
          );
        } catch (error) {
          // If calculation fails, keep default values
          console.warn("Failed to calculate HYBRID_APPROVAL metrics:", error);
        }
      }

      return baseResult;
    }
  }
}

export function parseOffChainProposalResults(
  // proposalResults is expected to be a stringified JSON of the offchain_tally object
  proposalResults: string,
  proposalType: ProposalType
): any {
  switch (proposalType) {
    case "OFFCHAIN_STANDARD":
    case "HYBRID_STANDARD":
      const tallyData = JSON.parse(proposalResults);
      const processTallySource = (
        sourceData: { [key: string]: number } | undefined
      ) => {
        return {
          for: BigInt(sourceData?.["1"] ?? 0),
          against: BigInt(sourceData?.["0"] ?? 0),
          abstain: BigInt(sourceData?.["2"] ?? 0),
        };
      };

      const result = {
        key: proposalType,
        kind: {
          APP: processTallySource(tallyData?.APP),
          USER: processTallySource(tallyData?.USER),
          CHAIN: processTallySource(tallyData?.CHAIN),
        },
      };

      if (proposalType === "OFFCHAIN_STANDARD") {
        const allForVotes =
          result.kind.APP.for + result.kind.USER.for + result.kind.CHAIN.for;
        const allAgainstVotes =
          result.kind.APP.against +
          result.kind.USER.against +
          result.kind.CHAIN.against;
        const allAbstainVotes =
          result.kind.APP.abstain +
          result.kind.USER.abstain +
          result.kind.CHAIN.abstain;
        return {
          ...result,
          kind: {
            ...result.kind,
            for: allForVotes,
            against: allAgainstVotes,
            abstain: allAbstainVotes,
          },
        };
      } else {
        return result;
      }

    case "OFFCHAIN_APPROVAL":
    case "HYBRID_APPROVAL": {
      const tallyData = JSON.parse(proposalResults);

      const processApprovalTallySource = (
        sourceData: Array<{ param: string; votes: number }> | undefined
      ) => {
        if (!sourceData || !Array.isArray(sourceData)) return {};

        // Convert the array of options to an object with option names as keys
        return sourceData.reduce(
          (acc, item) => {
            if (
              item &&
              typeof item === "object" &&
              "param" in item &&
              "votes" in item
            ) {
              acc[item.param] = BigInt(item.votes || 0);
            }
            return acc;
          },
          {} as Record<string, bigint>
        );
      };

      const result = {
        key: proposalType,
        kind: {
          APP: processApprovalTallySource(tallyData?.APP),
          USER: processApprovalTallySource(tallyData?.USER),
          CHAIN: processApprovalTallySource(tallyData?.CHAIN),
          totals: tallyData?.totals,
        },
      };
      if (proposalType === "OFFCHAIN_APPROVAL") {
        const allForVotes =
          result.kind.APP.for + result.kind.USER.for + result.kind.CHAIN.for;
        const allAgainstVotes =
          result.kind.APP.against +
          result.kind.USER.against +
          result.kind.CHAIN.against;

        return {
          ...result,
          kind: {
            ...result.kind,
            for: allForVotes,
            against: allAgainstVotes,
          },
        };
      }

      return result;
    }
    case "OFFCHAIN_OPTIMISTIC":
    case "OFFCHAIN_OPTIMISTIC_TIERED":
    case "HYBRID_OPTIMISTIC_TIERED": {
      const tallyData = JSON.parse(proposalResults);
      const processTallySource = (
        sourceData: { [key: string]: number } | undefined
      ) => {
        return {
          for: BigInt(sourceData?.["1"] ?? 0),
          against: BigInt(sourceData?.["0"] ?? 0),
          abstain: BigInt(sourceData?.["2"] ?? 0),
        };
      };

      const result = {
        key: proposalType,
        kind: {
          APP: processTallySource(tallyData?.APP),
          USER: processTallySource(tallyData?.USER),
          CHAIN: processTallySource(tallyData?.CHAIN),
        },
      };
      if (
        proposalType === "OFFCHAIN_OPTIMISTIC_TIERED" ||
        proposalType === "OFFCHAIN_OPTIMISTIC"
      ) {
        const allForVotes =
          result.kind.APP.for + result.kind.USER.for + result.kind.CHAIN.for;
        const allAgainstVotes =
          result.kind.APP.against +
          result.kind.USER.against +
          result.kind.CHAIN.against;

        return {
          ...result,
          kind: {
            ...result.kind,
            for: allForVotes,
            against: allAgainstVotes,
          },
        };
      }
      return result;
    }
    default:
      // Return a default structure for unsupported proposal types
      console.error(`Unsupported proposal type: ${proposalType}`);
      return {
        key: proposalType,
        kind: {},
      };
  }
}
