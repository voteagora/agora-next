/**
 * Forum Settings Utilities
 * Fetches and validates voting power requirements for forum actions
 */

import { prismaWeb2Client } from "@/app/lib/prisma";
import { cache } from "react";

interface ForumSettings {
  minVpForTopics: number;
  minVpForReplies: number;
  minVpForActions: number;
}

interface VPCheckResult {
  allowed: boolean;
  reason?: string;
  requiredVP?: number;
  currentVP?: number;
}

/**
 * Fetch forum settings for a DAO directly from database
 * Cached with React cache for performance
 */
async function getForumSettingsFromDB(daoSlug: string): Promise<ForumSettings> {
  try {
    const result = await prismaWeb2Client.$queryRaw<Array<{
      min_vp_for_topics: number;
      min_vp_for_replies: number;
      min_vp_for_actions: number;
    }>>`
      SELECT min_vp_for_topics, min_vp_for_replies, min_vp_for_actions 
      FROM alltenant.dao_forum_settings 
      WHERE dao_slug = ${daoSlug}
    `;
    
    if (result.length === 0) {
      // Return defaults if no settings found
      return {
        minVpForTopics: 1,
        minVpForReplies: 1,
        minVpForActions: 1,
      };
    }
    
    return {
      minVpForTopics: result[0].min_vp_for_topics,
      minVpForReplies: result[0].min_vp_for_replies,
      minVpForActions: result[0].min_vp_for_actions,
    };
  } catch (error) {
    console.error('Error fetching forum settings from DB:', error);
    // Return defaults on error
    return {
      minVpForTopics: 1,
      minVpForReplies: 1,
      minVpForActions: 1,
    };
  } finally {
    await prismaWeb2Client.$disconnect();
  }
}

/**
 * Cached version of getForumSettings
 * React cache ensures settings are fetched once per request
 */
export const getForumSettings = cache(getForumSettingsFromDB);

/**
 * Check if user has sufficient VP to create topics
 */
export async function canCreateTopic(
  currentVP: number,
  daoSlug: string
): Promise<VPCheckResult> {
  const settings = await getForumSettings(daoSlug);
  
  if (currentVP >= settings.minVpForTopics) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'insufficient_voting_power',
    requiredVP: settings.minVpForTopics,
    currentVP,
  };
}

/**
 * Check if user has sufficient VP to create posts/replies
 */
export async function canCreatePost(
  currentVP: number,
  daoSlug: string
): Promise<VPCheckResult> {
  const settings = await getForumSettings(daoSlug);
  
  if (currentVP >= settings.minVpForReplies) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'insufficient_voting_power',
    requiredVP: settings.minVpForReplies,
    currentVP,
  };
}

/**
 * Check if user has sufficient VP for other actions (upvote, react)
 */
export async function canPerformAction(
  currentVP: number,
  daoSlug: string
): Promise<VPCheckResult> {
  const settings = await getForumSettings(daoSlug);
  
  if (currentVP >= settings.minVpForActions) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'insufficient_voting_power',
    requiredVP: settings.minVpForActions,
    currentVP,
  };
}

/**
 * Format error message for insufficient VP
 */
export function formatVPError(check: VPCheckResult, action: string): string {
  if (check.allowed) return '';
  
  return `You need ${check.requiredVP} voting power to ${action}. You currently have ${check.currentVP}.`;
}
