"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/Drawer";
import Tenant from "@/lib/tenant/tenant";
import { useGovernanceChat } from "./useGovernanceChat";
import { List, ArrowUpRight } from "lucide-react";

export function ChatPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { ui, namespace, slug } = Tenant.current();
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    send,
    conversations,
    activeConversationId,
    createConversation,
    renameConversation,
    deleteConversation,
    setActiveConversation,
  } = useGovernanceChat();

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [showConversations, setShowConversations] = useState<boolean>(false);
  const active = conversations.find((c) => c.id === activeConversationId);
  const headerTitle = showConversations
    ? "Conversations"
    : active?.title || "New conversation";

  // Persist conversation list visibility per-tenant
  const listPrefKey = useMemo(
    () => `govchat:${namespace}:${slug}:showConversations`,
    [namespace, slug]
  );
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(listPrefKey);
      if (raw !== null) setShowConversations(raw === "true");
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listPrefKey]);
  useEffect(() => {
    try {
      window.localStorage.setItem(listPrefKey, String(showConversations));
    } catch (_) {}
  }, [showConversations, listPrefKey]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  return (
    <Drawer
      isOpen={open}
      onClose={() => onOpenChange(false)}
      position="right"
      className="w-full sm:max-w-[520px]"
      title={ui?.title || "Agora"}
      useHistoryBack={false}
    >
      <div className="flex items-center justify-between p-4 border-b border-line">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-primary font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-[300px]"
            title={headerTitle}
          >
            {headerTitle}
          </span>
          <Badge variant="secondary">AI Assistant</Badge>
        </div>
        <div className="flex items-center gap-2">
          {!showConversations && (
            <button
              type="button"
              onClick={() => setShowConversations(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral"
              aria-label="Show conversations"
            >
              <List className="h-5 w-5 text-primary" />
            </button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              if (messages.length === 0) return;
              createConversation();
              setShowConversations(false);
            }}
          >
            New chat
          </Button>
        </div>
      </div>

      {showConversations && (
        <div className="px-4 pt-3 border-b border-line">
          <div className="grid grid-cols-1 gap-3">
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`rounded-lg border p-3 transition-colors ${
                  c.id === activeConversationId
                    ? "bg-gray-100 border-gray-300"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                {editingId === c.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      renameConversation(c.id, editingTitle);
                      setEditingId(null);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="h-8"
                    />
                    <Button type="submit" className="h-8 px-3">
                      Save
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <button
                      className="text-sm text-left flex-1"
                      onClick={() => {
                        setActiveConversation(c.id);
                        setShowConversations(false);
                      }}
                    >
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-tertiary">
                        {new Date(c.updatedAt).toLocaleString()}
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-xs text-tertiary hover:text-primary"
                        onClick={() => {
                          setEditingId(c.id);
                          setEditingTitle(c.title);
                        }}
                        aria-label="Rename conversation"
                      >
                        Rename
                      </button>
                      <button
                        className="text-xs text-red-600 hover:text-red-700"
                        onClick={() => deleteConversation(c.id)}
                        aria-label="Delete conversation"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!showConversations && (
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              className="px-2 py-1 rounded-full bg-neutral text-primary text-sm"
              onClick={() => send("Show latest proposals")}
            >
              Latest proposals
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded-full bg-neutral text-primary text-sm"
              onClick={() => send("List active proposals")}
            >
              Active proposals
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded-full bg-neutral text-primary text-sm"
              onClick={() => send("How to vote")}
            >
              How to vote
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded-full bg-neutral text-primary text-sm"
              onClick={() => send("Open forums")}
            >
              Open forums
            </button>
            <button
              type="button"
              className="px-2 py-1 rounded-full bg-neutral text-primary text-sm"
              onClick={() => send("My drafts")}
            >
              My drafts
            </button>
            {ui?.toggle("duna")?.enabled && (
              <>
                <button
                  type="button"
                  className="px-2 py-1 rounded-full bg-neutral text-primary text-sm"
                  onClick={() => send("DUNA overview")}
                >
                  DUNA overview
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded-full bg-neutral text-primary text-sm"
                  onClick={() => send("List DUNA documents")}
                >
                  DUNA documents
                </button>
                <button
                  type="button"
                  className="px-2 py-1 rounded-full bg-neutral text-primary text-sm"
                  onClick={() => send("Latest DUNA reports")}
                >
                  DUNA reports
                </button>
              </>
            )}
          </div>
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              <div
                className={`inline-block rounded-lg px-3 py-2 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {/* UI renderer for assistant messages with items */}
                {m.role === "assistant" &&
                m.ui &&
                Array.isArray(m.ui.items) &&
                m.ui.items.length > 0 ? (
                  <div className="text-left">
                    {m.ui.heading && (
                      <div className="font-semibold mb-2 flex items-center justify-between">
                        <span>{m.ui.heading}</span>
                        {m.ui.seeAllHref && (
                          <a
                            href={m.ui.seeAllHref}
                            className="text-sm text-blue-700 underline"
                          >
                            {m.ui.seeAllLabel || "See all"}
                          </a>
                        )}
                      </div>
                    )}
                    <div className="space-y-2">
                      {m.ui.items.map((it, idx) => {
                        const kind = (it as any).kind as string | undefined;
                        const isDraft = kind === "draft";
                        const isProposal = kind === "proposal";
                        const ctaLabel = isDraft
                          ? "Open draft"
                          : isProposal
                            ? "Open proposal"
                            : "Open";
                        const status = (it.status || "")
                          .toString()
                          .toUpperCase();
                        let badgeClass = "bg-gray-200 text-gray-700";
                        if (status === "ACTIVE" || status === "QUEUED")
                          badgeClass = "bg-blue-100 text-blue-800";
                        else if (status === "SUCCEEDED" || status === "PASSED")
                          badgeClass = "bg-green-100 text-green-800";
                        else if (status === "DEFEATED" || status === "FAILED")
                          badgeClass = "bg-red-100 text-red-800";
                        else if (status === "PENDING" || status === "DRAFT")
                          badgeClass = "bg-yellow-100 text-yellow-800";
                        else if (status === "REPORT")
                          badgeClass = "bg-indigo-100 text-indigo-800";
                        else if (status === "DOC")
                          badgeClass = "bg-gray-100 text-gray-700";
                        return (
                          <div
                            key={`${it.id}-${idx}`}
                            className="rounded-md border border-gray-200 bg-white text-gray-900 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium pr-2">
                                {it.title}
                              </div>
                              {it.status && (
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded ${badgeClass}`}
                                >
                                  {String(it.status)}
                                </span>
                              )}
                            </div>
                            {it.href && (
                              <a
                                href={it.href}
                                className="inline-flex items-center gap-1 text-sm text-blue-700 underline mt-2"
                              >
                                {ctaLabel} <ArrowUpRight className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>{m.content}</>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!showConversations && (
        <form onSubmit={handleSubmit} className="p-3 border-t border-line">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              aria-label="Chat input"
              onKeyDown={(e) => e.stopPropagation()}
            />
            <Button
              type="submit"
              disabled={isLoading}
              aria-label="Send message"
            >
              Send
            </Button>
          </div>
          <div className="mt-2 text-xs text-tertiary">
            Press Enter to send. Esc closes the panel.
          </div>
        </form>
      )}
    </Drawer>
  );
}

export default ChatPanel;
