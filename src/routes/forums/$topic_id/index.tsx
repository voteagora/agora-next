/*
 * TanStack Start route for /forums/:topic_id (no slug).
 * Redirects to the canonical slug URL, or renders the topic if no slug exists.
 * URL: /forums/:topic_id
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { transformForumTopics, buildForumTopicSlug } from "@/lib/forumUtils";

export const Route = createFileRoute("/forums/$topic_id/")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("forums")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
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
    if (canonicalSlug) {
      throw redirect({
        to: `/forums/${topicId}/${canonicalSlug}` as string,
      });
    }

    // No slug — this IS the canonical URL; pass data to component
    return { topicId, noSlug: true };
  },
  component: function ForumTopicIndexPage() {
    // Reached only when the topic has no slug
    return null;
  },
});
