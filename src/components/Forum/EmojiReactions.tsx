"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useForum } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { SmilePlus } from "lucide-react";
import useRequireLogin from "@/hooks/useRequireLogin";
import { useStableCallback } from "@/hooks/useStableCallback";
import { InsufficientVPModal } from "./InsufficientVPModal";

type AddressesByEmoji = Record<string, string[]>;

const DEFAULT_EMOJIS = ["👍", "🔥", "🤔", "👀", "🎉", "❤️", "👏", "😄", "🤝"];

interface EmojiReactionsProps {
  targetType: "post" | "topic";
  targetId: number;
  initialByEmoji?: AddressesByEmoji;
}

export default function EmojiReactions({
  targetType,
  targetId,
  initialByEmoji,
}: EmojiReactionsProps) {
  const { address } = useAccount();
  const [byEmoji, setByEmoji] = React.useState<AddressesByEmoji>(
    initialByEmoji || {}
  );
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<Set<string>>(new Set());
  const { addReaction, removeReaction, permissions, checkVPBeforeAction } =
    useForum();
  const requireLogin = useRequireLogin();
  const [showVPModal, setShowVPModal] = useState(false);

  // Create stable callbacks that always use the latest values
  const stableAddReaction = useStableCallback(addReaction);
  const stableRemoveReaction = useStableCallback(removeReaction);

  const mineSet = React.useMemo(() => {
    const me = (address || "").toLowerCase();
    const s = new Set<string>();
    Object.entries(byEmoji).forEach(([emoji, addrs]) => {
      if (addrs?.some((a) => a.toLowerCase() === me)) s.add(emoji);
    });
    return s;
  }, [byEmoji, address]);

  const handleToggle = React.useCallback(
    async (emoji: string, opts?: { closeOnAdd?: boolean }) => {
      const loggedInAddress = await requireLogin();
      if (!loggedInAddress) {
        return;
      }

      const me = loggedInAddress.toLowerCase();
      const currentlyMine = (byEmoji[emoji] || []).some(
        (a) => a.toLowerCase() === me
      );

      // Only check VP when adding reaction (not removing)
      if (!currentlyMine) {
        const vpCheck = checkVPBeforeAction("react");
        if (!vpCheck.canProceed) {
          setShowVPModal(true);
          return;
        }
      }

      setPending((p) => new Set(p).add(emoji));

      // Optimistically update UI
      let previousState: AddressesByEmoji;
      setByEmoji((prevState) => {
        previousState = prevState;
        if (currentlyMine) {
          const arr = (prevState[emoji] || []).filter(
            (a) => a.toLowerCase() !== me
          );
          const next = { ...prevState } as AddressesByEmoji;
          if (arr.length === 0) delete next[emoji];
          else next[emoji] = arr;
          return next;
        } else {
          const arr = prevState[emoji] ? [...prevState[emoji]] : [];
          if (!arr.some((a) => a.toLowerCase() === me))
            arr.push(loggedInAddress);
          return { ...prevState, [emoji]: arr };
        }
      });

      // Make API call with stable callbacks
      const ok = currentlyMine
        ? await stableRemoveReaction(targetType, targetId, emoji)
        : await stableAddReaction(targetType, targetId, emoji);

      // Revert on failure
      if (!ok) {
        setByEmoji(previousState!);
      } else if (opts?.closeOnAdd && !currentlyMine) {
        setOpen(false);
      }

      setPending((p) => {
        const n = new Set(p);
        n.delete(emoji);
        return n;
      });
    },
    [
      byEmoji,
      requireLogin,
      stableAddReaction,
      stableRemoveReaction,
      targetType,
      targetId,
      checkVPBeforeAction,
    ]
  );

  const hasReactions = Object.keys(byEmoji).length > 0;

  const sortedEntries = React.useMemo(() => {
    const order = new Map<string, number>();
    DEFAULT_EMOJIS.forEach((e, i) => order.set(e, i));
    return Object.entries(byEmoji).sort((a, b) => {
      const ca = a[1]?.length || 0;
      const cb = b[1]?.length || 0;
      if (cb !== ca) return cb - ca;
      const oa = order.get(a[0]) ?? Number.MAX_SAFE_INTEGER;
      const ob = order.get(b[0]) ?? Number.MAX_SAFE_INTEGER;
      if (oa !== ob) return oa - ob;
      return a[0].localeCompare(b[0]);
    });
  }, [byEmoji]);

  return (
    <>
      <div className="flex items-center gap-2">
        {hasReactions && (
          <div className="flex items-center gap-2">
            {sortedEntries.map(([emoji, addresses]) => (
              <div
                key={`${targetType}-${targetId}-${emoji}`}
                className={`px-2.5 py-1 rounded-full inline-flex items-center gap-2 cursor-pointer ${
                  mineSet.has(emoji)
                    ? "bg-primary/5 text-primary-700"
                    : "border border-primary/5"
                } ${pending.has(emoji) ? "opacity-70" : ""}`}
                onClick={() => handleToggle(emoji)}
                title="React"
              >
                <span className="text-neutral-900 text-xs font-semibold tracking-[3.60px]">
                  {emoji}
                </span>
                <span className="text-neutral-700 text-xs font-semibold">
                  {addresses?.length || 0}
                </span>
              </div>
            ))}
          </div>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-1.5 py-1 text-neutral-700"
            >
              <SmilePlus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-2 w-[220px]">
            <div className="grid grid-cols-6 gap-1">
              {DEFAULT_EMOJIS.map((e) => (
                <button
                  key={`${targetType}-${targetId}-pick-${e}`}
                  className="text-base hover:bg-neutral-100 rounded px-1 py-0.5"
                  onClick={() => handleToggle(e, { closeOnAdd: true })}
                >
                  {e}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <InsufficientVPModal
        isOpen={showVPModal}
        onClose={() => setShowVPModal(false)}
        action="react"
      />
    </>
  );
}
