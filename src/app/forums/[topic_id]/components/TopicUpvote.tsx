"use client";

import React, { useState } from "react";
import { ChevronUp, Loader2 } from "lucide-react";
import { useForum } from "@/hooks/useForum";
import { useAccount } from "wagmi";
import useRequireLogin from "@/hooks/useRequireLogin";
import { rgbStringToHex } from "@/app/lib/utils/color";
import Tenant from "@/lib/tenant/tenant";
import { useStableCallback } from "@/hooks/useStableCallback";
import { InsufficientVPModal } from "@/components/Forum/InsufficientVPModal";
const { ui } = Tenant.current();

export default function TopicUpvote({
  topicId,
  className = "",
}: {
  topicId: number;
  className?: string;
}) {
  const { address } = useAccount();
  const {
    upvoteTopic,
    removeUpvoteTopic,
    fetchTopicUpvotes,
    hasUpvotedTopic,
    checkVPBeforeAction,
  } = useForum();
  const [count, setCount] = React.useState<number | null>(null);
  const [mine, setMine] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const requireLogin = useRequireLogin();
  const stableUpvoteTopic = useStableCallback(upvoteTopic);
  const stableRemoveUpvoteTopic = useStableCallback(removeUpvoteTopic);
  const mineRef = React.useRef(mine);
  const [showVPModal, setShowVPModal] = useState(false);

  React.useEffect(() => {
    mineRef.current = mine;
  }, [mine]);

  React.useEffect(() => {
    let mounted = true;
    setCount(null);
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
    if (loading || count === null) return;
    const loggedIn = await requireLogin();
    if (!loggedIn) return;

    // Only check VP when adding upvote (not removing)
    if (!mineRef.current) {
      const vpCheck = checkVPBeforeAction("upvote");
      if (!vpCheck.canProceed) {
        setShowVPModal(true);
        return;
      }
    }

    setLoading(true);
    try {
      if (mineRef.current) {
        const updated = await stableRemoveUpvoteTopic(topicId);
        if (updated !== null) {
          setCount(updated);
          setMine(false);
        }
      } else {
        const updated = await stableUpvoteTopic(topicId);
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
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={loading || count === null}
        title={mine ? "Remove upvote" : "Upvote"}
        aria-label={count === null ? "Loading upvotes" : `${count} upvotes`}
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
        <div className="absolute inset-x-0 bottom-2 flex justify-center text-secondary text-xs font-semibold">
          {count === null ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : (
            count
          )}
        </div>
      </button>

      <InsufficientVPModal
        isOpen={showVPModal}
        onClose={() => setShowVPModal(false)}
        action="upvote"
      />
    </>
  );
}
