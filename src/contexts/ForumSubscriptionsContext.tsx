"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useAccount, useSignTypedData } from "wagmi";
import {
  getForumSubscriptions,
  subscribeToForumContent,
  unsubscribeFromForumContent,
} from "@/lib/actions/forum";
import toast from "react-hot-toast";
import {
  FORUM_SUBSCRIPTIONS_PRIMARY_TYPE,
  FORUM_SUBSCRIPTIONS_TYPED_DATA_DOMAIN,
  FORUM_SUBSCRIPTIONS_TYPED_DATA_TYPES,
  hashForumSubscriptionsPayload,
  type ForumSubscriptionsAction,
} from "@/lib/forumSubscriptionsSignedRequests";

interface ForumSubscriptionsContextValue {
  // State
  watchedTopics: Set<number>;
  watchedCategories: Set<number>;
  isLoading: boolean;
  isReady: boolean;

  // Actions
  toggleTopicWatch: (topicId: number, topicTitle?: string) => Promise<boolean>;
  toggleCategoryWatch: (
    categoryId: number,
    categoryName: string
  ) => Promise<boolean>;
  isTopicWatched: (topicId: number) => boolean;
  isCategoryWatched: (categoryId: number) => boolean;
}

const ForumSubscriptionsContext =
  createContext<ForumSubscriptionsContextValue | null>(null);

export function ForumSubscriptionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [watchedTopics, setWatchedTopics] = useState<Set<number>>(new Set());
  const [watchedCategories, setWatchedCategories] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const createSignedRequest = useCallback(
    async (action: ForumSubscriptionsAction, payload: unknown) => {
      if (!address) throw new Error("Wallet not connected");

      const timestamp = Math.floor(Date.now() / 1000);
      const nonce =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${timestamp}-${Math.random()}`;

      const signature = await signTypedDataAsync({
        domain: FORUM_SUBSCRIPTIONS_TYPED_DATA_DOMAIN,
        types: FORUM_SUBSCRIPTIONS_TYPED_DATA_TYPES,
        primaryType: FORUM_SUBSCRIPTIONS_PRIMARY_TYPE,
        message: {
          action,
          address,
          timestamp: BigInt(timestamp),
          nonce,
          payload_hash: hashForumSubscriptionsPayload(payload),
        },
      });

      return { address, signature, action, timestamp, nonce, payload };
    },
    [address, signTypedDataAsync]
  );

  // Fetch subscriptions once when wallet connects
  useEffect(() => {
    if (!address) {
      setWatchedTopics(new Set());
      setWatchedCategories(new Set());
      setIsReady(true);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      try {
        const res = await getForumSubscriptions(address);
        if (cancelled) return;
        if (res.success && res.data) {
          setWatchedTopics(
            new Set(
              res.data.topicSubscriptions.map(
                (s: { topicId: number }) => s.topicId
              )
            )
          );
          setWatchedCategories(
            new Set(
              res.data.categorySubscriptions.map(
                (s: { categoryId: number }) => s.categoryId
              )
            )
          );
        }
      } catch (err) {
        if (!cancelled) console.error("Failed to fetch subscriptions:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address]);

  const toggleTopicWatch = useCallback(
    async (topicId: number, topicTitle?: string): Promise<boolean> => {
      if (!address || actionLoading) return false;

      const isWatching = watchedTopics.has(topicId);
      const actionKey = `topic-${topicId}`;
      setActionLoading(actionKey);

      try {
        const label = topicTitle || `topic ${topicId}`;

        if (isWatching) {
          const signed = await createSignedRequest("unsubscribe", {
            targetType: "topic",
            targetId: topicId,
          });

          // Optimistic update after signature
          setWatchedTopics((prev) => {
            const next = new Set(prev);
            next.delete(topicId);
            return next;
          });

          const res = await unsubscribeFromForumContent(signed);
          if (!res.success) {
            // Revert on API failure
            setWatchedTopics((prev) => new Set(prev).add(topicId));
            throw new Error(res.error || "Failed to unsubscribe");
          }
          toast.success(`Unwatched "${label}"`);
        } else {
          const signed = await createSignedRequest("subscribe", {
            targetType: "topic",
            targetId: topicId,
          });

          // Optimistic update after signature
          setWatchedTopics((prev) => new Set(prev).add(topicId));

          const res = await subscribeToForumContent(signed);
          if (!res.success) {
            // Revert on API failure
            setWatchedTopics((prev) => {
              const next = new Set(prev);
              next.delete(topicId);
              return next;
            });
            throw new Error(res.error || "Failed to subscribe");
          }
          toast.success(`Watching "${label}"`);
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Action failed";
        // Only show error toast if it's not a user rejection
        if (!msg.includes("User rejected") && !msg.includes("user rejected")) {
          toast.error(msg);
        }
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [address, actionLoading, watchedTopics, createSignedRequest]
  );

  const toggleCategoryWatch = useCallback(
    async (categoryId: number, categoryName: string): Promise<boolean> => {
      if (!address || actionLoading) return false;

      const isWatching = watchedCategories.has(categoryId);
      const actionKey = `category-${categoryId}`;
      setActionLoading(actionKey);

      try {
        if (isWatching) {
          const signed = await createSignedRequest("unsubscribe", {
            targetType: "category",
            targetId: categoryId,
          });

          // Optimistic update after signature
          setWatchedCategories((prev) => {
            const next = new Set(prev);
            next.delete(categoryId);
            return next;
          });

          const res = await unsubscribeFromForumContent(signed);
          if (!res.success) {
            // Revert on API failure
            setWatchedCategories((prev) => new Set(prev).add(categoryId));
            throw new Error(res.error || "Failed to unsubscribe");
          }
          toast.success(`Unwatched ${categoryName}`);
        } else {
          const signed = await createSignedRequest("subscribe", {
            targetType: "category",
            targetId: categoryId,
          });

          // Optimistic update after signature
          setWatchedCategories((prev) => new Set(prev).add(categoryId));

          const res = await subscribeToForumContent(signed);
          if (!res.success) {
            // Revert on API failure
            setWatchedCategories((prev) => {
              const next = new Set(prev);
              next.delete(categoryId);
              return next;
            });
            throw new Error(res.error || "Failed to subscribe");
          }
          toast.success(`Watching ${categoryName}`);
        }
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Action failed";
        // Only show error toast if it's not a user rejection
        if (!msg.includes("User rejected") && !msg.includes("user rejected")) {
          toast.error(msg);
        }
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [address, actionLoading, watchedCategories, createSignedRequest]
  );

  const isTopicWatched = useCallback(
    (topicId: number) => watchedTopics.has(topicId),
    [watchedTopics]
  );

  const isCategoryWatched = useCallback(
    (categoryId: number) => watchedCategories.has(categoryId),
    [watchedCategories]
  );

  const value = useMemo(
    () => ({
      watchedTopics,
      watchedCategories,
      isLoading,
      isReady,
      toggleTopicWatch,
      toggleCategoryWatch,
      isTopicWatched,
      isCategoryWatched,
    }),
    [
      watchedTopics,
      watchedCategories,
      isLoading,
      isReady,
      toggleTopicWatch,
      toggleCategoryWatch,
      isTopicWatched,
      isCategoryWatched,
    ]
  );

  return (
    <ForumSubscriptionsContext.Provider value={value}>
      {children}
    </ForumSubscriptionsContext.Provider>
  );
}

export function useForumSubscriptions() {
  const context = useContext(ForumSubscriptionsContext);
  if (!context) {
    throw new Error(
      "useForumSubscriptions must be used within ForumSubscriptionsProvider"
    );
  }
  return context;
}
