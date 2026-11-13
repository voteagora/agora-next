export const CIVIC_SURVEY_KEYS = {
  featuredBriefing: "civic-featured-briefing",
} as const;

export const CIVIC_FEATURED_SURVEY_TITLE =
  "What should CIVIC’s next supporter briefing cover?";

export const CIVIC_FEATURED_SURVEY_DESCRIPTION =
  "Pick one. Your vote is public and helps decide what we brief next.";

export const CIVIC_FEATURED_SURVEY_PROMPT = "Choose one topic";

export const CIVIC_FEATURED_SURVEY_OPTIONS = [
  "Preventing harm to civilians",
  "Amends and recognition",
  "Urban warfare",
  "Peacekeeping",
] as const;

export type CivicInvolvementLevelId = "updates" | "occasional" | "fully";

export const CIVIC_INVOLVEMENT_LEVELS = [
  {
    id: "updates" as const,
    label: "Just the updates",
    description:
      "Email me when CIVIC publishes a supporter briefing or major announcement.",
    eventTypes: ["proposal_published", "forum_discussion_in_watched_category"],
  },
  {
    id: "occasional" as const,
    label: "Occasionally active",
    description:
      "Briefings, plus email when there’s a new community poll to vote on.",
    eventTypes: [
      "proposal_published",
      "proposal_reminder_24h",
      "forum_discussion_in_watched_category",
    ],
  },
  {
    id: "fully" as const,
    label: "Fully involved",
    description:
      "Briefings, polls, and email when someone replies to your posts or topics you follow.",
    eventTypes: [
      "proposal_published",
      "proposal_reminder_24h",
      "forum_discussion_in_watched_category",
      "forum_reply_to_your_comment",
      "forum_comment_watched",
      "forum_reaction_received",
    ],
  },
] as const;
