import { useSafeApiKit } from "@/contexts/SafeApiKitContext";
import { useQuery } from "@tanstack/react-query";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { getAddress, decodeAbiParameters } from "viem";
import { getTitleFromProposalDescription } from "@/lib/proposalUtils";
import { keccak256, toUtf8Bytes } from "ethers";
import Tenant from "@/lib/tenant/tenant";
import { decodeVoteTransaction, decodeProposalTransaction, decodeProposalActionTransaction } from "@/lib/governorTransactionDecoder";
import { decodeDelegationTransaction } from "@/lib/delegationTransactionDecoder";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";

export const useSafePendingTransactions = () => {
  const { safeApiKit } = useSafeApiKit();
  const { contracts } = Tenant.current();
 
  const { selectedWalletAddress, isSelectedPrimaryAddress } =
    useSelectedWallet();
  const { address } = useAccount();
  const { slug } = Tenant.current(); // Get slug from tenant
  const expectedOrigin = `Agora-${slug}`;
  const governorContract = contracts.governor.contract as IGovernorContract;

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
    if (!pendingTransactions?.results || !address || !governorContract) return {};
    
    return pendingTransactions.results.reduce((acc, transaction) => {
      if (!transaction.data) return acc;

      const decoded = decodeVoteTransaction(transaction.data as `0x${string}`, governorContract);
      if (decoded) {
        acc[decoded.proposalId] = `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
      }
      return acc;
    }, {} as Record<string, string>);
  }, [address, pendingTransactions?.results, governorContract]);

  const pendingDelegations = useMemo(() => {
    if (!pendingTransactions?.results || !address) return {};
    
    return pendingTransactions.results.reduce((acc, transaction) => {
      if (!transaction.data) return acc;

      // First check if it's a decoded transaction
      if (transaction.dataDecoded?.method === "delegate" && transaction.dataDecoded.parameters?.length >= 1) {
        const delegateAddress = transaction.dataDecoded.parameters[0].value as string;
        acc[delegateAddress] = `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
        return acc;
      }

      // Then try to decode the raw transaction data
      const decoded = decodeDelegationTransaction(transaction.data as `0x${string}`);
      if (decoded) {
        decoded.delegatees.forEach(delegateAddress => {
          acc[delegateAddress] = `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
        });
      }
      return acc;
    }, {} as Record<string, string>);
  }, [address, pendingTransactions?.results]);

  const pendingProposals = useMemo(() => {
    if (!pendingTransactions?.results || !address || !governorContract) return {};

    return pendingTransactions.results.reduce((acc, transaction) => {
      if (!transaction.data) return acc;

      const decoded = decodeProposalTransaction(transaction.data as `0x${string}`, governorContract);
      if (decoded) {
        const title = getTitleFromProposalDescription(decoded.description);
        acc[transaction.safeTxHash] = {
          description: decoded.description,
          status: `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`,
          type: decoded.type,
          transaction,
          title,
        };
      }
      return acc;
    }, {} as Record<string, {
      description: string;
      status: string;
      type: string;
      transaction: any;
      title: string;
    }>);
  }, [pendingTransactions?.results, address, governorContract]);

  type ProposalAction = "queue" | "cancel" | "execute";

  const getProposalsForDescription = useMemo(
    () => (
      description: string | null,
      proposalId: string,
      action: ProposalAction
    ) => {
      if (!description || !governorContract) return {};
      if (!pendingTransactions?.results) return {};
      if (action !== "execute" && !address) return {};

      const descriptionHash = keccak256(toUtf8Bytes(description));
      const transactions = pendingTransactions.results;

      return transactions.reduce((acc, transaction) => {
        if (!transaction.data) return acc;

        const decoded = decodeProposalActionTransaction(transaction.data as `0x${string}`, governorContract);
        if (decoded?.action === action && transaction.data.includes(descriptionHash.slice(2))) {
          acc[proposalId] = `${transaction.confirmations?.length}/${transaction.confirmationsRequired}`;
        }
        return acc;
      }, {} as Record<string, string>);
    },
    [governorContract, pendingTransactions?.results, address]
  );

  const memoizedGetQueueProposals = useMemo(
    () => (description: string | null, proposalId: string) => 
      getProposalsForDescription(description, proposalId, "queue"),
    [getProposalsForDescription]
  );

  const memoizedGetCancelProposals = useMemo(
    () => (description: string | null, proposalId: string) => 
      getProposalsForDescription(description, proposalId, "cancel"),
    [getProposalsForDescription]
  );

  const memoizedGetExecuteProposals = useMemo(
    () => (description: string | null, proposalId: string) => 
      getProposalsForDescription(description, proposalId, "execute"),
    [getProposalsForDescription]
  );

  return {
    pendingTransactions,
    allMessages,
    pendingTransactionsForOwner,
    pendingVotes,
    pendingDelegations,
    pendingProposals,
    getQueueProposalsForDescription: memoizedGetQueueProposals,
    getCancelProposalsForDescription: memoizedGetCancelProposals,
    getExecuteProposalsForDescription: memoizedGetExecuteProposals,
    refetch,
  };
};
