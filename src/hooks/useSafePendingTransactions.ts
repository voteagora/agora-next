import { useSafeApiKit } from "@/contexts/SafeApiKitContext";
import { useQuery } from "@tanstack/react-query";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { decodeAbiParameters, getAddress } from "viem";
import { getTitleFromProposalDescription } from "@/lib/proposalUtils";
import { keccak256, toUtf8Bytes } from "ethers";
import Tenant from "@/lib/tenant/tenant";

export const useSafePendingTransactions = () => {
  const { safeApiKit } = useSafeApiKit();
  const { selectedWalletAddress, isSelectedPrimaryAddress } =
    useSelectedWallet();
  const { address } = useAccount();
  const { slug } = Tenant.current(); // Get slug from tenant
  const expectedOrigin = `Agora-${slug}`;

  const { data: pendingTransactions, refetch } = useQuery({
    queryKey: ["safe-pending-transactions", selectedWalletAddress],
    queryFn: async () => {
      return await safeApiKit?.getPendingTransactions(
        selectedWalletAddress as `0x${string}`
      );
    },
    enabled: !isSelectedPrimaryAddress && !!selectedWalletAddress,
  });

  const { data: allMessages } = useQuery({
    queryKey: ["safe-pending-messages", selectedWalletAddress],
    queryFn: async () => {
      return await safeApiKit?.getMessages(
        selectedWalletAddress as `0x${string}`
      );
    },
    enabled: !isSelectedPrimaryAddress && !!selectedWalletAddress,
  });
  console.log("pendingTransactions", pendingTransactions);
  const pendingTransactionsForOwner = useMemo(() => {
    if (!pendingTransactions?.results || !address) return [];

    return pendingTransactions.results.filter((transaction) => {
      // Check if user hasn't confirmed this tx yet
      const userConfirmed = transaction.confirmations?.some(
        (conf) => getAddress(conf.owner) === getAddress(address)
      );

      return (
        !userConfirmed ||
        (transaction.proposer !== address &&
          !transaction.isExecuted &&
          transaction.origin === expectedOrigin) // Filter by origin
      );
    });
  }, [pendingTransactions, address, expectedOrigin]);

  const pendingVotes = useMemo(() => {
    if (!pendingTransactions?.results || !address) return {};
    return pendingTransactions.results.reduce(
      (acc, transaction) => {
        // Check if it's a castVote transaction
        if (
          transaction.dataDecoded?.method === "castVote" &&
          transaction.dataDecoded.parameters?.length >= 1
        ) {
          // Get the proposalId from the first parameter
          const proposalId = transaction.dataDecoded.parameters[0].value;
          acc[proposalId] =
            `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
        } else if (transaction.data?.slice(0, 10) === "0x5f398a14") {
          try {
            // approval voting
            const inputData = transaction.data.slice(10);

            // Decode the parameters - this structure may need adjustment based on the actual function
            const decoded = decodeAbiParameters(
              [
                { type: "bytes32", name: "proposalId" },
                { type: "uint8", name: "support" },
                { type: "string", name: "reason" },
                { type: "bytes", name: "params" },
              ],
              `0x${inputData}` as `0x${string}`
            );

            const proposalIdBytes = decoded[0] as `0x${string}`;

            const proposalIdBigInt = BigInt(proposalIdBytes);
            const proposalId = proposalIdBigInt.toString();
            acc[proposalId] =
              `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
          } catch (error) {
            console.warn("Failed to decode specialized vote data:", error);
          }
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }, [address, pendingTransactions?.results, expectedOrigin]);

  const pendingDelegations = useMemo(() => {
    if (!pendingTransactions?.results || !address) return {};
    return pendingTransactions.results.reduce(
      (acc, transaction) => {
        if (
          transaction.dataDecoded?.method === "delegate" &&
          transaction.dataDecoded.parameters?.length >= 1
        ) {
          const delegateAddress = transaction.dataDecoded.parameters[0].value;
          acc[delegateAddress] =
            `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
        } else if (transaction.data) {
          try {
            const functionSelector = transaction.data.slice(0, 10);
            const inputData = transaction.data.slice(10);

            if (functionSelector === "0x5c19a95c") {
              const decoded = decodeAbiParameters(
                [{ type: "address", name: "delegatee" }],
                `0x${inputData}` as `0x${string}`
              );
              const delegateAddress = decoded[0];
              acc[delegateAddress] =
                `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
            } else if (functionSelector === "0xaf7b3857") {
              // AgoraToken partial delegation: delegate(PartialDelegation[])
              const decoded = decodeAbiParameters(
                [
                  {
                    type: "tuple[]",
                    name: "_partialDelegations",
                    components: [
                      { name: "_delegatee", type: "address" },
                      { name: "_numerator", type: "uint96" },
                    ],
                  },
                ],
                `0x${inputData}` as `0x${string}`
              );

              if (decoded[0]?.length > 0) {
                // Extract delegatees from the struct array
                decoded[0].forEach((delegation: { _delegatee: string }) => {
                  acc[delegation._delegatee] =
                    `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
                });
              }
            } else if (functionSelector === "0x72b9db46") {
              // subdelegateBatched(address[],uint256[])
              const decoded = decodeAbiParameters(
                [
                  { type: "address[]", name: "delegatees" },
                  { type: "uint256[]", name: "rules" },
                ],
                `0x${inputData}` as `0x${string}`
              );

              const [delegatees] = decoded;
              if (delegatees?.length > 0) {
                delegatees.forEach((delegateAddress) => {
                  acc[delegateAddress] =
                    `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
                });
              }
            }
          } catch (error) {
            console.error(
              "Error processing transaction:",
              transaction.safeTxHash,
              error
            );
          }
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }, [pendingTransactions, expectedOrigin]);

  const pendingProposals = useMemo(() => {
    if (!pendingTransactions?.results || !address) return {};

    return pendingTransactions.results.reduce(
      (acc, transaction) => {
        try {
          // Check for propose function selector (0x9a79018e)
          if (transaction.data?.slice(0, 10) === "0x9a79018e") {
            // Extract description from calldata
            const inputData = transaction.data.slice(10);

            // Decode the propose function parameters
            const decoded = decodeAbiParameters(
              [
                { type: "address[]", name: "targets" },
                { type: "uint256[]", name: "values" },
                { type: "bytes[]", name: "calldatas" },
                { type: "string", name: "description" },
              ],
              `0x${inputData}` as `0x${string}`
            );

            // Get the description which contains the proposal title
            const description = decoded[3];

            // Use the transaction hash as the key
            const title = getTitleFromProposalDescription(description);
            acc[transaction.safeTxHash] = {
              description,
              status: `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`,
              type: "basic",
              transaction,
              title,
            };
          } else if (transaction.data?.slice(0, 10) === "0xb3e43242") {
            try {
              // This is proposeWithModule for Approval proposals
              // Function signature: proposeWithModule(address,tuple,tuple[],tuple[],string)
              const inputData = transaction.data.slice(10);

              const decoded = decodeAbiParameters(
                [
                  { type: "address", name: "approvalModuleAddress" },
                  { type: "bytes", name: "encodedData" },
                  { type: "string", name: "description" },
                  {
                    type: "tuple",
                    name: "proposalSettings",
                    components: [
                      { type: "uint8", name: "proposalType" },
                      { type: "uint8", name: "quorumThreshold" },
                      { type: "address", name: "votingToken" },
                      { type: "uint128", name: "startBlockNumber" },
                      { type: "uint128", name: "endBlockNumber" },
                    ],
                  },
                ],
                `0x${inputData}` as `0x${string}`
              );

              // Extract the description and title
              const description = decoded[2];
              const title = getTitleFromProposalDescription(description);

              acc[transaction.safeTxHash] = {
                description,
                status: `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`,
                type: "approval",
                transaction,
                title,
              };
            } catch (error) {
              console.warn("Failed to decode approval proposal data:", error);
            }
          }
        } catch (error) {
          console.error("Error processing proposal transaction:", error);
        }
        return acc;
      },
      {} as Record<
        string,
        {
          description: string;
          status: string;
          type: string;
          transaction: any;
          title: string;
        }
      >
    );
  }, [pendingTransactions, address, expectedOrigin]);

  const getQueueProposalsForDescription = (
    description: string | null,
    proposalId: string
  ) => {
    if (!pendingTransactions?.results || !address || !description) return {};

    // Get the description hash
    const descriptionHash = keccak256(toUtf8Bytes(description));

    return pendingTransactions.results.reduce(
      (acc, transaction) => {
        // Check for queue transaction (0x160cbed7)
        if (transaction.data?.slice(0, 10) === "0x160cbed7") {
          try {
            const inputData = transaction.data.slice(10);

            if (inputData.includes(descriptionHash.slice(2))) {
              acc[proposalId] =
                `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
              return acc; // Return early after finding a match
            }
          } catch (error) {
            console.warn("Failed to decode queue proposal data:", error);
          }
        } else if (transaction.data?.slice(0, 10) === "0x3d12a85a") {
          // Check for queueWithModule transaction
          try {
            const inputData = transaction.data.slice(10);

            if (inputData.includes(descriptionHash.slice(2))) {
              acc[proposalId] =
                `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
              return acc; // Return early after finding a match
            }
          } catch (error) {
            console.warn(
              "Failed to decode queueWithModule proposal data:",
              error
            );
          }
        }
        return acc;
      },
      {} as Record<string, string>
    );
  };

  const getCancelProposalsForDescription = (
    description: string | null,
    proposalId: string
  ) => {
    if (!pendingTransactions?.results || !address || !description) return {};

    // Get the description hash
    const descriptionHash = keccak256(toUtf8Bytes(description));

    return pendingTransactions.results.reduce(
      (acc, transaction) => {
        // Check for cancel transaction (function selector for cancel)
        if (transaction.data?.slice(0, 10) === "0x40e58ee5") {
          try {
            const inputData = transaction.data.slice(10);

            if (inputData.includes(descriptionHash.slice(2))) {
              acc[proposalId] =
                `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
              return acc; // Return early after finding a match
            }
          } catch (error) {
            console.warn("Failed to decode cancel proposal data:", error);
          }
        } else if (transaction.data?.slice(0, 10) === "0x4bc93b96") {
          try {
            // Check for cancelWithModule transaction
            const inputData = transaction.data.slice(10);

            if (inputData.includes(descriptionHash.slice(2))) {
              acc[proposalId] =
                `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
              return acc; // Return early after finding a match
            }
          } catch (error) {
            console.warn(
              "Failed to decode cancelWithModule proposal data:",
              error
            );
          }
        }
        return acc;
      },
      {} as Record<string, string>
    );
  };

  const getExecuteProposalsForDescription = (
    description: string | null,
    proposalId: string
  ) => {
    if (!description) {
      return {} as Record<string, string>;
    }

    // Get the description hash
    const descriptionHash = keccak256(toUtf8Bytes(description));

    return pendingTransactions?.results?.reduce(
      (acc, transaction) => {
        // Check for execute transaction (function selector for execute)
        if (transaction.data?.slice(0, 10) === "0x72db799f") {
          try {
            const inputData = transaction.data.slice(10);

            if (inputData.includes(descriptionHash.slice(2))) {
              acc[proposalId] =
                `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
              return acc; // Return early after finding a match
            }
          } catch (error) {
            console.warn("Failed to decode execute proposal data:", error);
          }
        } else if (transaction.data?.slice(0, 10) === "0x5d2c2a0d") {
          // Check for executeWithModule transaction
          try {
            const inputData = transaction.data.slice(10);

            if (inputData.includes(descriptionHash.slice(2))) {
              acc[proposalId] =
                `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
              return acc; // Return early after finding a match
            }
          } catch (error) {
            console.warn(
              "Failed to decode executeWithModule proposal data:",
              error
            );
          }
        }
        return acc;
      },
      {} as Record<string, string>
    );
  };

  return {
    pendingTransactions,
    allMessages,
    pendingTransactionsForOwner,
    pendingVotes,
    pendingDelegations,
    pendingProposals,
    getQueueProposalsForDescription,
    getCancelProposalsForDescription,
    getExecuteProposalsForDescription,
    refetch,
  };
};
