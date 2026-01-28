import type { PreferenceState } from "./types";

export const EVENT_CATEGORIES = [
  { id: "proposals", label: "Proposals" },
  { id: "forums", label: "Forums" },
] as const;

export type EventCategoryId = (typeof EVENT_CATEGORIES)[number]["id"];

export interface EventTypeDefinition {
  event_type: string;
  display_name: string;
  description: string;
  category: EventCategoryId;
  default_state: PreferenceState;
}

export const EVENT_TYPE_DEFINITIONS: EventTypeDefinition[] = [
  {
    event_type: "proposal_created",
    display_name: "New Proposal Created",
    description: "When a new governance proposal is published",
    category: "proposals",
    default_state: "on",
  },
  {
    event_type: "forum_comment_engaged",
    display_name: "Comment on Engaged Discussion",
    description: "Comment on a discussion you created or commented in",
    category: "forums",
    default_state: "on",
  },
  {
    event_type: "forum_comment_watched",
    display_name: "Comment on Watched Discussion",
    description: "Comment on a discussion you're watching (excludes engaged)",
    category: "forums",
    default_state: "on",
  },
  {
    event_type: "forum_discussion_in_watched_category",
    display_name: "New Discussion in Watched Category",
    description: "New topic in a category you subscribe to",
    category: "forums",
    default_state: "on",
  },
  {
    event_type: "forum_reply_to_your_comment",
    display_name: "Direct Reply to Your Comment",
    description: "Someone replied directly to your comment",
    category: "forums",
    default_state: "on",
  },
  {
    event_type: "forum_reaction_received",
    display_name: "Reaction on Your Post",
    description: "Someone reacted to your comment",
    category: "forums",
    default_state: "off",
  },
  {
    event_type: "forum_topic_upvoted",
    display_name: "Your Topic Was Upvoted",
    description: "Someone upvoted your discussion topic",
    category: "forums",
    default_state: "off",
  },
];
