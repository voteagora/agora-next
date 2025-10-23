"use client";

import React, { createContext, useContext } from "react";
import { useForumPermissions } from "@/hooks/useForumPermissions";

interface ForumPermissions {
  canCreateTopic: boolean;
  canCreatePost: boolean;
  canUpvote: boolean;
  canReact: boolean;
  currentVP: string;
  settings: {
    minVpForTopics: number;
    minVpForReplies: number;
    minVpForActions: number;
    minVpForProposals: number;
  } | null;
  isLoading: boolean;
  isAdmin: boolean;
  reasons: {
    topics?: string;
    posts?: string;
    actions?: string;
  };
}

const ForumPermissionsContext = createContext<ForumPermissions | null>(null);

export function ForumPermissionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const permissions = useForumPermissions();

  return (
    <ForumPermissionsContext.Provider value={permissions}>
      {children}
    </ForumPermissionsContext.Provider>
  );
}

export function useForumPermissionsContext(): ForumPermissions {
  const context = useContext(ForumPermissionsContext);
  if (!context) {
    throw new Error(
      "useForumPermissionsContext must be used within ForumPermissionsProvider"
    );
  }
  return context;
}
