import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getPublicClient } from "@/lib/viem";
import Tenant from "@/lib/tenant/tenant";
import {
  fetchVotingPowerFromContract,
  formatVotingPowerString,
} from "@/lib/votingPowerUtils";
import { useHasPermission } from "./useRbacPermissions";

interface ForumSettings {
  minVpForTopics: number;
  minVpForReplies: number;
  minVpForActions: number;
  minVpForProposals: number;
}

interface ForumPermissions {
  canCreateTopic: boolean;
  canCreatePost: boolean;
  canCreateProposal: boolean;
  canUpvote: boolean;
  canReact: boolean;
  currentVP: string;
  settings: ForumSettings | null;
  isLoading: boolean;
  reasons: {
    topics?: string;
    posts?: string;
    actions?: string;
  };
}

/**
 * Hook to check if the connected user has sufficient voting power for forum actions
 * Integrates RBAC permissions:
 * - Users with specific RBAC permissions can bypass VP requirements for their permitted actions
 * - VP requirements still apply for users without specific permissions
 * Uses client-side checks to provide immediate feedback before server validation
 */
export function useForumPermissions(): ForumPermissions {
  const { address } = useAccount();
  const { slug, contracts, namespace } = Tenant.current();
  const client = getPublicClient();

  // Specific RBAC permission checks for each action
  const { hasPermission: hasTopicPermission, isLoading: topicPermLoading } =
    useHasPermission("forums", "topics", "create");
  const { hasPermission: hasPostPermission, isLoading: postPermLoading } =
    useHasPermission("forums", "posts", "create");
  const {
    hasPermission: hasProposalPermission,
    isLoading: proposalPermLoading,
  } = useHasPermission("proposals", "proposals", "create");
  // Fetch voting power directly from the contract
  const { data: votingPower, isLoading: vpLoading } = useQuery({
    queryKey: ["votingPower", address],
    queryFn: async () => {
      if (!address) return BigInt(0);

      return fetchVotingPowerFromContract(client, address, {
        namespace,
        contracts,
      });
    },
    enabled: !!address,
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    retry: 1, // Retry once on failure
    retryDelay: 500, // Wait 500ms before retry
  });

  // Fetch forum settings for current DAO
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["forumSettings", slug],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/forum/settings?daoSlug=${slug}`);

        if (!response.ok) {
          console.error("Failed to fetch forum settings");
          return null;
        }

        const data = await response.json();
        return data as ForumSettings;
      } catch (error) {
        console.error("Error fetching forum settings:", error);
        // Return default settings on error
        return {
          minVpForTopics: 0,
          minVpForReplies: 0,
          minVpForActions: 0,
          minVpForProposals: 0,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Only retry once
    retryDelay: 500, // Wait 500ms before retry
  });

  const isLoading =
    vpLoading ||
    settingsLoading ||
    topicPermLoading ||
    postPermLoading ||
    proposalPermLoading;

  // If not connected or loading, return default permissions
  if (!address || isLoading || !settings) {
    return {
      canCreateTopic: false,
      canCreatePost: false,
      canCreateProposal: false,
      canUpvote: false,
      canReact: false,
      currentVP: "0",
      settings: settings || null,
      isLoading,
      reasons: {},
    };
  }

  const currentVotes = votingPower || BigInt(0);

  // Convert voting power to number for comparisons
  const vpAsNumber = Number(currentVotes / BigInt(10 ** 18));

  // Get VP thresholds from settings
  const minVpForTopics = Number(settings?.minVpForTopics || 0);
  const minVpForReplies = Number(settings?.minVpForReplies || 0);
  const minVpForActions = Number(settings?.minVpForActions || 0);

  // Permission checks: RBAC permission OR sufficient voting power
  // - forums.topics.create permission bypasses VP for topic creation
  // - forums.posts.create permission bypasses VP for posts, upvotes, and reactions
  const canCreateTopic = hasTopicPermission || vpAsNumber >= minVpForTopics;
  const canCreatePost = hasPostPermission || vpAsNumber >= minVpForReplies;
  const canUpvote = hasPostPermission || vpAsNumber >= minVpForActions;
  const canReact = hasPostPermission || vpAsNumber >= minVpForActions;
  const canCreateProposal = hasProposalPermission;

  const reasons: ForumPermissions["reasons"] = {};

  // Only show VP reasons for users without RBAC permissions
  if (!canCreateTopic && !hasTopicPermission) {
    reasons.topics = `You need ${minVpForTopics} voting power to create topics. You currently have ${vpAsNumber}.`;
  }

  if (!canCreatePost && !hasPostPermission) {
    reasons.posts = `You need ${minVpForReplies} voting power to post replies. You currently have ${vpAsNumber}.`;
  }

  if ((!canUpvote || !canReact) && !hasPostPermission) {
    reasons.actions = `You need ${minVpForActions} voting power to upvote and react. You currently have ${vpAsNumber}.`;
  }

  return {
    canCreateTopic,
    canCreatePost,
    canCreateProposal,
    canUpvote,
    canReact,
    currentVP: vpAsNumber.toString(),
    settings,
    isLoading,
    reasons,
  };
}
