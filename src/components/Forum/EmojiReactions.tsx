"use client";

import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useForum } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { SmilePlus } from "lucide-react";

type AddressesByEmoji = Record<string, string[]>;

const DEFAULT_EMOJIS = ["👍", "🔥", "🤔", "👀", "🎉", "❤️", "👏", "😄", "🤝"];

interface EmojiReactionsProps {
  targetType: "post" | "topic";
  targetId: number;
  initialByEmoji?: AddressesByEmoji;
}

export default function EmojiReactions({ targetType, targetId, initialByEmoji }: EmojiReactionsProps) {
  const { address } = useAccount();
  const [byEmoji, setByEmoji] = React.useState<AddressesByEmoji>(initialByEmoji || {});
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState<Set<string>>(new Set());
  const { addReaction, removeReaction } = useForum();

  const mineSet = React.useMemo(() => {
    const me = (address || "").toLowerCase();
    const s = new Set<string>();
    Object.entries(byEmoji).forEach(([emoji, addrs]) => {
      if (addrs?.some((a) => a.toLowerCase() === me)) s.add(emoji);
    });
    return s;
  }, [byEmoji, address]);

  const handleToggle = async (emoji: string, opts?: { closeOnAdd?: boolean }) => {
    const me = (address || "").toLowerCase();
    const currentlyMine = mineSet.has(emoji);

    if (!address) {
      const ok = currentlyMine
        ? await removeReaction(targetType, targetId, emoji)
        : await addReaction(targetType, targetId, emoji);
      if (ok && opts?.closeOnAdd && !currentlyMine) setOpen(false);
      return;
    }

    setPending((p) => new Set(p).add(emoji));
    const prev = byEmoji;
    if (currentlyMine) {
      setByEmoji((prevState) => {
        const arr = (prevState[emoji] || []).filter((a) => a !== me);
        const next = { ...prevState } as AddressesByEmoji;
        if (arr.length === 0) delete next[emoji];
        else next[emoji] = arr;
        return next;
      });
      const ok = await removeReaction(targetType, targetId, emoji);
      if (!ok) setByEmoji(prev);
    } else {
      setByEmoji((prevState) => {
        const arr = prevState[emoji] ? [...prevState[emoji]] : [];
        if (!arr.includes(me)) arr.push(me);
        return { ...prevState, [emoji]: arr };
      });
      const ok = await addReaction(targetType, targetId, emoji);
      if (!ok) setByEmoji(prev);
      if (ok && opts?.closeOnAdd) setOpen(false);
    }
    setPending((p) => {
      const n = new Set(p);
      n.delete(emoji);
      return n;
    });
  };

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
    <div className="flex items-center gap-2">
      {hasReactions && (
        <div className="flex items-center gap-2">
          {sortedEntries.map(([emoji, addresses]) => (
            <div
              key={`${targetType}-${targetId}-${emoji}`}
              className={`px-2.5 py-1 rounded-full inline-flex items-center gap-2 cursor-pointer ${
                mineSet.has(emoji) ? "bg-primary/5 text-primary-700" : "border border-primary/5"
              } ${pending.has(emoji) ? "opacity-70" : ""}`}
              onClick={() => handleToggle(emoji)}
              title="React"
            >
              <span className="text-neutral-900 text-xs font-semibold tracking-[3.60px]">{emoji}</span>
              <span className="text-neutral-700 text-xs font-semibold">{addresses?.length || 0}</span>
            </div>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto px-1.5 py-1 text-neutral-700">
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
  );
}

