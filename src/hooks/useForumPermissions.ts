import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import { checkForumPermissions } from "@/lib/actions/forum/admin";
import { getPublicClient } from "@/lib/viem";
import { TENANT_NAMESPACES } from "@/lib/constants";

interface ForumSettings {
  minVpForTopics: number;
  minVpForReplies: number;
  minVpForActions: number;
}

interface ForumPermissions {
  canCreateTopic: boolean;
  canCreatePost: boolean;
  canUpvote: boolean;
  canReact: boolean;
  currentVP: string;
  settings: ForumSettings | null;
  isLoading: boolean;
  isAdmin: boolean;
  reasons: {
    topics?: string;
    posts?: string;
    actions?: string;
  };
}

/**
 * Hook to check if the connected user has sufficient voting power for forum actions
 * Admins (admin, duna_admin, super_admin) bypass all VP requirements
 * Uses client-side checks to provide immediate feedback before server validation
 */
export function useForumPermissions(): ForumPermissions {
  const { address } = useAccount();
  const { slug, contracts, namespace } = Tenant.current();
  const client = getPublicClient();
  console.log(address, "address", "loading permissions");
  // Fetch voting power directly from the contract
  const {
    data: votingPower,
    isLoading: vpLoading,
    error: vpError,
  } = useQuery({
    queryKey: ["votingPower", address],
    queryFn: async () => {
      if (!address) return BigInt(0);

      try {
        // Get current block number
        const blockNumber = await client.getBlockNumber();

        let votes: bigint;
        if (
          namespace === TENANT_NAMESPACES.UNISWAP ||
          namespace === TENANT_NAMESPACES.SYNDICATE ||
          namespace === TENANT_NAMESPACES.TOWNS
        ) {
          votes = (await client.readContract({
            abi: contracts.token.abi,
            address: contracts.token.address as `0x${string}`,
            functionName: "getPriorVotes",
            args: [address, blockNumber - BigInt(1)],
          })) as unknown as bigint;
        } else {
          votes = (await client.readContract({
            abi: contracts.governor.abi,
            address: contracts.governor.address as `0x${string}`,
            functionName: "getVotes",
            args: [address, blockNumber - BigInt(1)],
          })) as unknown as bigint;
        }

        return votes;
      } catch (error) {
        console.error("Failed to fetch voting power:", error);
        return BigInt(0);
      }
    },
    enabled: !!address,
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  // Fetch forum settings for current DAO
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["forumSettings", slug],
    queryFn: async () => {
      const response = await fetch(`/api/forum/settings?daoSlug=${slug}`);
      if (!response.ok) {
        console.error("Failed to fetch forum settings");
        return null;
      }
      return response.json() as Promise<ForumSettings>;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const normalizedAddress = address?.toLowerCase();
  const { data: adminCheck, isLoading: adminLoading } = useQuery({
    queryKey: ["forumAdmin", normalizedAddress],
    queryFn: () => checkForumPermissions(normalizedAddress || ""),
    enabled: !!normalizedAddress,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const isLoading = vpLoading || settingsLoading || adminLoading;
  const isAdmin = adminCheck?.isAdmin || false;

  // If not connected or loading, return default permissions
  if (!address || isLoading || !settings) {
    return {
      canCreateTopic: false,
      canCreatePost: false,
      canUpvote: false,
      canReact: false,
      currentVP: "0",
      settings: settings || null,
      isLoading,
      isAdmin: false,
      reasons: {},
    };
  }

  const vpBigInt = votingPower || BigInt(0);
  const vpAsNumber = Number(vpBigInt);
  // Admins bypass all VP requirements
  // Ensure settings values are numbers for comparison
  const minVpForTopics = Number(settings.minVpForTopics);
  const minVpForReplies = Number(settings.minVpForReplies);
  const minVpForActions = Number(settings.minVpForActions);

  const canCreateTopic = isAdmin || vpAsNumber >= minVpForTopics;
  const canCreatePost = isAdmin || vpAsNumber >= minVpForReplies;
  const canUpvote = isAdmin || vpAsNumber >= minVpForActions;
  const canReact = isAdmin || vpAsNumber >= minVpForActions;

  const reasons: ForumPermissions["reasons"] = {};

  // Only show VP reasons for non-admins
  if (!isAdmin) {
    if (!canCreateTopic) {
      reasons.topics = `You need ${minVpForTopics} voting power to create topics. You currently have ${vpAsNumber}.`;
    }

    if (!canCreatePost) {
      reasons.posts = `You need ${minVpForReplies} voting power to post replies. You currently have ${vpAsNumber}.`;
    }

    if (!canUpvote || !canReact) {
      reasons.actions = `You need ${minVpForActions} voting power to upvote and react. You currently have ${vpAsNumber}.`;
    }
  }

  return {
    canCreateTopic,
    canCreatePost,
    canUpvote,
    canReact,
    currentVP: vpAsNumber.toString(),
    settings,
    isLoading,
    isAdmin,
    reasons,
  };
}
