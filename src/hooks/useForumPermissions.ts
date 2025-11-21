import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getPublicClient } from "@/lib/viem";
import Tenant from "@/lib/tenant/tenant";
import {
  fetchVotingPowerFromContract,
  formatVotingPowerString,
} from "@/lib/votingPowerUtils";
import { useUserPermissions, useIsSuperAdmin } from "./useRbacPermissions";
import type { DaoSlug } from "@prisma/client";

interface ForumSettings {
  minVpForTopics: number;
  minVpForReplies: number;
  minVpForActions: number;
  minVpForProposals: number;
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
  hasRbacPermissions: boolean; // New: indicates RBAC permissions available
  reasons: {
    topics?: string;
    posts?: string;
    actions?: string;
  };
}

/**
 * Hook to check if the connected user has sufficient voting power for forum actions
 * Integrates RBAC permissions:
 * - Users with RBAC roles bypass all VP requirements
 * - RBAC permissions used for granular admin actions
 * - VP requirements still apply for regular users
 * Uses client-side checks to provide immediate feedback before server validation
 */
export function useForumPermissions(): ForumPermissions {
  const { address } = useAccount();
  const { slug, contracts, namespace } = Tenant.current();
  const client = getPublicClient();
  const normalizedAddress = address?.toLowerCase();

  // RBAC permission checks
  const { data: rbacPermissions, isLoading: rbacLoading } = useUserPermissions(
    normalizedAddress,
    slug as DaoSlug
  );
  const { data: isSuperAdmin, isLoading: superAdminLoading } =
    useIsSuperAdmin(normalizedAddress);

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
    vpLoading || settingsLoading || rbacLoading || superAdminLoading;

  // Check if user is admin via RBAC system
  const hasRbacPerms =
    (rbacPermissions?.permissions.length || 0) > 0 || isSuperAdmin || false;
  const isAdmin = hasRbacPerms;

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
      hasRbacPermissions: false,
      reasons: {},
    };
  }

  const currentVotes = votingPower || BigInt(0);

  // Convert voting power to number for comparisons
  const vpAsNumber = Number(currentVotes / BigInt(10 ** 18));

  // Admins with RBAC roles bypass all VP requirements
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
    hasRbacPermissions: hasRbacPerms,
    reasons,
  };
}
