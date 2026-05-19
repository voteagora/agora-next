/**
 * TanStack Start createServerFn wrappers for forum subscription "use server" actions.
 *
 * ForumSubscriptionsContext (a "use client" component) calls these directly.
 * The original src/lib/actions/forum/subscriptions.ts is stubbed to undefined
 * in the client bundle by the stubServerOnlyModulesInClient Vite plugin, so
 * client code must import from here instead.
 */
import { createServerFn } from "@tanstack/react-start";

import type {
  getForumSubscriptions as _OrigGetForumSubscriptions,
  subscribeToForumContent as _OrigSubscribeToForumContent,
  unsubscribeFromForumContent as _OrigUnsubscribeFromForumContent,
} from "@/lib/actions/forum/subscriptions";

// ─── getForumSubscriptions ────────────────────────────────────────────────────

const _serverGetForumSubscriptions = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { getForumSubscriptions: fn } = await import(
      "@/lib/actions/forum/subscriptions"
    );
    return fn(data.address);
  });

export const getForumSubscriptions: typeof _OrigGetForumSubscriptions = (
  address
) => _serverGetForumSubscriptions({ data: { address } }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

// ─── subscribeToForumContent ──────────────────────────────────────────────────

type SignedRequest = {
  address: string;
  signature: string;
  action: "subscribe" | "unsubscribe";
  timestamp: number;
  nonce: string;
  payload: unknown;
};

const _serverSubscribeToForumContent = createServerFn({ method: "POST" })
  .inputValidator((data: SignedRequest) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { subscribeToForumContent: fn } = await import(
      "@/lib/actions/forum/subscriptions"
    );
    return fn(data);
  });

export const subscribeToForumContent: typeof _OrigSubscribeToForumContent = (
  data
) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _serverSubscribeToForumContent({ data: data as any }) as any;

// ─── unsubscribeFromForumContent ──────────────────────────────────────────────

const _serverUnsubscribeFromForumContent = createServerFn({ method: "POST" })
  .inputValidator((data: SignedRequest) => data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .handler(async ({ data }): Promise<any> => {
    const { unsubscribeFromForumContent: fn } = await import(
      "@/lib/actions/forum/subscriptions"
    );
    return fn(data);
  });

export const unsubscribeFromForumContent: typeof _OrigUnsubscribeFromForumContent =
  (data) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _serverUnsubscribeFromForumContent({ data: data as any }) as any;
