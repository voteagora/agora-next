import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import useConnectedDelegate from "./useConnectedDelegate";
import Tenant from "@/lib/tenant/tenant";
import { checkForumPermissions } from "@/lib/actions/forum/admin";

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
  const delegateData = useConnectedDelegate();
  const { slug } = Tenant.current();

  const delegate = delegateData.delegate;
  const delegateLoading = delegateData.isLoading;

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

  // Check if user is a forum admin
  const { data: adminCheck, isLoading: adminLoading } = useQuery({
    queryKey: ["forumAdmin", address],
    queryFn: () => checkForumPermissions(address || ""),
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const isLoading = delegateLoading || settingsLoading || adminLoading;
  const isAdmin = adminCheck?.isAdmin || false;

  // If not connected or loading, return default permissions
  if (!address || isLoading || !delegate || !settings) {
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

  const currentVP = parseInt(delegate.votingPower.total || "0");

  // Admins bypass all VP requirements
  const canCreateTopic = isAdmin || currentVP >= settings.minVpForTopics;
  const canCreatePost = isAdmin || currentVP >= settings.minVpForReplies;
  const canUpvote = isAdmin || currentVP >= settings.minVpForActions;
  const canReact = isAdmin || currentVP >= settings.minVpForActions;

  const reasons: ForumPermissions["reasons"] = {};

  // Only show VP reasons for non-admins
  if (!isAdmin) {
    if (!canCreateTopic) {
      reasons.topics = `You need ${settings.minVpForTopics} voting power to create topics. You currently have ${currentVP}.`;
    }

    if (!canCreatePost) {
      reasons.posts = `You need ${settings.minVpForReplies} voting power to post replies. You currently have ${currentVP}.`;
    }

    if (!canUpvote || !canReact) {
      reasons.actions = `You need ${settings.minVpForActions} voting power to upvote and react. You currently have ${currentVP}.`;
    }
  }

  return {
    canCreateTopic,
    canCreatePost,
    canUpvote,
    canReact,
    currentVP: currentVP.toString(),
    settings,
    isLoading,
    isAdmin,
    reasons,
  };
}
