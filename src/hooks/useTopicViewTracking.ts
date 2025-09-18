import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { trackForumView } from "@/lib/actions/forum/analytics";

interface UseTopicViewTrackingProps {
  topicId: number;
  enabled?: boolean;
}

export function useTopicViewTracking({
  topicId,
  enabled = true,
}: UseTopicViewTrackingProps) {
  const { address } = useAccount();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!enabled || !topicId || hasTracked.current) {
      return;
    }

    const trackView = async () => {
      try {
        const result = await trackForumView({
          targetType: "topic",
          targetId: topicId,
          address: address || undefined,
        });

        if (result.success) {
          hasTracked.current = true;
        }
      } catch (error) {
        console.error("Failed to track topic view:", error);
      }
    };

    // Track view after a short delay to ensure the page has loaded
    const timeoutId = setTimeout(trackView, 1000);

    return () => clearTimeout(timeoutId);
  }, [topicId, address, enabled]);

  return {
    hasTracked: hasTracked.current,
  };
}
