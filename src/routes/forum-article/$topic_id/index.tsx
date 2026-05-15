/*
 * TanStack Start route for /forum-article/:topic_id (no slug).
 * Redirects to the canonical slug URL.
 * URL: /forum-article/:topic_id
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import { transformForumTopics, buildForumTopicSlug } from "@/lib/forumUtils";

export const Route = createFileRoute("/forum-article/$topic_id/")({
  loader: async ({ params }) => {
    const { getForumTopic } = await import("@/lib/actions/forum");

    const topicId = Number(params.topic_id);
    if (!Number.isFinite(topicId)) {
      throw redirect({ to: "/forums" });
    }

    const result = await getForumTopic(topicId);
    if (!result?.success || !result.data) {
      throw redirect({ to: "/forums" });
    }

    const transformedTopics = transformForumTopics([result.data]);
    const transformed = transformedTopics[0];
    if (!transformed) {
      throw redirect({ to: "/forums" });
    }

    const canonicalSlug = buildForumTopicSlug(transformed.title);
    throw redirect({
      to: (canonicalSlug
        ? `/forum-article/${topicId}/${canonicalSlug}`
        : `/forums/${topicId}`) as string,
    });
  },
  component: () => null,
});
