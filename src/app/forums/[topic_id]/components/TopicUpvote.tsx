"use client";

import React from "react";
import { ChevronUp } from "lucide-react";
import { useForum } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import { rgbStringToHex } from "@/app/lib/utils/color";
import Tenant from "@/lib/tenant/tenant";
const { ui } = Tenant.current();

export default function TopicUpvote({
  topicId,
  className = "",
}: {
  topicId: number;
  className?: string;
}) {
  const { address, isConnected } = useAccount();
  const { upvoteTopic, removeUpvoteTopic, fetchTopicUpvotes, hasUpvotedTopic } =
    useForum();
  const [count, setCount] = React.useState<number>(0);
  const [mine, setMine] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const c = await fetchTopicUpvotes(topicId);
      const m = await hasUpvotedTopic(topicId);
      if (mounted) {
        setCount(c);
        setMine(m);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [topicId, address, fetchTopicUpvotes, hasUpvotedTopic]);

  const toggle = async () => {
    if (!isConnected) return; // upstream will toast in hook
    if (loading) return;
    setLoading(true);
    try {
      if (mine) {
        const updated = await removeUpvoteTopic(topicId);
        if (updated !== null) {
          setCount(updated);
          setMine(false);
        }
      } else {
        const updated = await upvoteTopic(topicId);
        if (updated !== null) {
          setCount(updated);
          setMine(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={mine ? "Remove upvote" : "Upvote"}
      className={`w-8 h-[42px] bg-neutral rounded relative inline-flex items-center justify-center ${className}`}
    >
      <div className="absolute inset-x-0 top-1 flex justify-center text-secondary bg-neutral">
        <ChevronUp
          className="w-[18px] h-[18px]"
          strokeWidth={2}
          color={
            mine ? rgbStringToHex(ui.customization?.positive) : "currentColor"
          }
        />
      </div>
      <div className="absolute inset-x-0 bottom-2 text-center text-secondary text-xs font-semibold">
        {count}
      </div>
    </button>
  );
}
