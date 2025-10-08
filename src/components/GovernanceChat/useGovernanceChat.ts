"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

type ChatUIItem = {
  id: string | number;
  title: string;
  status?: string | null;
  href?: string;
  kind?: "proposal" | "draft" | "report" | "doc" | string;
};
type ChatUIPayload = {
  heading?: string;
  items?: ChatUIItem[];
  seeAllHref?: string;
  seeAllLabel?: string;
};
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  ui?: ChatUIPayload;
};

export function useGovernanceChat() {
  const { namespace, slug } = Tenant.current();
  const { address, isConnected } = useAccount();

  type Conversation = {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
  };

  const storageKey = useMemo(
    () => `govchat:${namespace}:${slug}:conversations`,
    [namespace, slug]
  );

  const readConversations = (): Conversation[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Conversation[]) : [];
    } catch (_) {
      return [];
    }
  };

  const writeConversations = (convs: Conversation[]) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(convs));
    } catch (_) {}
  };

  const sortByUpdated = (convs: Conversation[]) =>
    [...convs].sort((a, b) => b.updatedAt - a.updatedAt);

  const deriveTitle = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return "New conversation";
    const singleLine = trimmed.replace(/\s+/g, " ");
    return singleLine.length > 60 ? singleLine.slice(0, 57) + "…" : singleLine;
  };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  const createWelcomeMessage = useCallback((): ChatMessage => {
    return {
      role: "assistant",
      content:
        "Hi, I'm Kleos. I can help with proposals, drafts, delegates, DUNA and more. Try 'latest proposals', 'my drafts' or 'how to vote'.",
    };
  }, []);

  // initialize from localStorage
  useEffect(() => {
    const initial = readConversations();
    if (initial.length === 0) {
      const first: Conversation = {
        id: crypto.randomUUID(),
        title: "New conversation",
        messages: [createWelcomeMessage()],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations([first]);
      setActiveId(first.id);
      writeConversations([first]);
    } else {
      setConversations(initial);
      setActiveId(initial[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // persist on change
  useEffect(() => {
    if (conversations.length > 0) writeConversations(conversations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId),
    [conversations, activeId]
  );

  const messages = activeConversation?.messages ?? [];

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateActive = (updater: (c: Conversation) => Conversation) => {
    setConversations((prev) => {
      const mapped = prev.map((c) => (c.id === activeId ? updater(c) : c));
      return sortByUpdated(mapped);
    });
  };

  const append = useCallback(
    (message: ChatMessage) => {
      updateActive((c) => ({
        ...c,
        messages: [...c.messages, message],
        updatedAt: Date.now(),
      }));
    },
    [activeId]
  );

  const stop = useCallback(() => {
    // no streaming cancel needed for current implementation
  }, []);

  const submit = useCallback(
    async (textOverride?: string) => {
      const userText = (textOverride ?? input).trim();
      if (!userText) return;

      const nextMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: userText },
      ];
      updateActive((c) => ({
        ...c,
        title: c.messages.length === 0 ? deriveTitle(userText) : c.title,
        messages: nextMessages,
        updatedAt: Date.now(),
      }));
      if (textOverride === undefined) setInput("");
      setIsLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages,
            tenant: { namespace, slug },
            mode: "ui",
          }),
        });
        if (!res.ok) throw new Error("Chat request failed");
        const data = await res.json();
        const assistantText = String(data.textFallback ?? "");
        updateActive((c) => ({
          ...c,
          messages: [
            ...c.messages,
            {
              role: "assistant",
              content: assistantText,
              ui: {
                heading: data.heading,
                items: Array.isArray(data.items) ? data.items : [],
                // Inject login CTA if needed
              },
            },
          ],
          updatedAt: Date.now(),
        }));
      } catch (_) {
        updateActive((c) => ({
          ...c,
          messages: [
            ...c.messages,
            { role: "assistant", content: "Sorry, something went wrong." },
          ],
          updatedAt: Date.now(),
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [input, messages, namespace, slug]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await submit();
    },
    [submit]
  );

  const send = useCallback(
    async (text: string) => {
      if (!text) return;
      await submit(text);
    },
    [submit]
  );

  // Conversation management
  const createConversation = useCallback((title?: string) => {
    const conv: Conversation = {
      id: crypto.randomUUID(),
      title: title?.trim() || "New conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => sortByUpdated([conv, ...prev]));
    setActiveId(conv.id);
  }, []);

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, title: title.trim() || c.title, updatedAt: Date.now() }
          : c
      )
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      setActiveId((prevActive) =>
        prevActive === id && filtered.length ? filtered[0].id : prevActive
      );
      if (filtered.length === 0) {
        const conv: Conversation = {
          id: crypto.randomUUID(),
          title: "New conversation",
          messages: [createWelcomeMessage()],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setActiveId(conv.id);
        return [conv];
      }
      return filtered;
    });
  }, []);

  const setActiveConversation = useCallback(
    (id: string) => setActiveId(id),
    []
  );

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    stop,
    append,
    send,
    // conversations state
    conversations,
    activeConversationId: activeId,
    createConversation,
    renameConversation,
    deleteConversation,
    setActiveConversation,
  };
}
