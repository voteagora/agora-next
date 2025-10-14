import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getPublicClient } from "@/lib/viem";
import Tenant from "@/lib/tenant/tenant";
import { checkForumPermissions } from "@/lib/actions/forum/admin";
import {
  fetchVotingPowerFromContract,
  formatVotingPowerString,
} from "@/lib/votingPowerUtils";

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
        };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Only retry once
    retryDelay: 500, // Wait 500ms before retry
  });

  const normalizedAddress = address?.toLowerCase();
  const { data: adminCheck, isLoading: adminLoading } = useQuery({
    queryKey: ["forumAdmin", normalizedAddress],
    queryFn: async () => {
      try {
        const result = await checkForumPermissions(normalizedAddress || "");
        return result;
      } catch (error) {
        console.error("Failed to check admin permissions:", error);
        // Default to non-admin on error
        return { isAdmin: false };
      }
    },
    enabled: !!normalizedAddress,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: false, // Don't retry admin checks
    placeholderData: { isAdmin: false }, // Optimistic default
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

  const currentVotes = votingPower || BigInt(0);
  const formattedVP = formatVotingPowerString(currentVotes);
  
  // Convert voting power to number for comparisons
  const vpAsNumber = Number(currentVotes / BigInt(10 ** 18));
  
  // Admins bypass all VP requirements
  // Ensure settings values are numbers for comparison
  const minVpForTopics = Number(settings?.minVpForTopics || 0);
  const minVpForReplies = Number(settings?.minVpForReplies || 0);
  const minVpForActions = Number(settings?.minVpForActions || 0);
  
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
