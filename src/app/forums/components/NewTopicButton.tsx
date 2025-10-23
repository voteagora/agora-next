"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CreateTopicModal from "./CreateTopicModal";
import useRequireLogin from "@/hooks/useRequireLogin";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

const { namespace, ui } = Tenant.current();

interface TopicContext {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
  commentsCount?: number;
  isTempCheck?: boolean;
  tempCheckPassed?: boolean;
}

interface NewTopicButtonProps {
  isDuna: boolean;
  topicContext?: TopicContext;
}

export default function NewTopicButton({ isDuna, topicContext }: NewTopicButtonProps) {
  const [open, setOpen] = React.useState(false);
  const requireLogin = useRequireLogin();
  const router = useRouter();
  
  const isEASV2Enabled = ui.toggle("enable-easv2-govlessvoting")?.enabled;

  const handleClick = async () => {
    const loggedIn = await requireLogin();
    if (!loggedIn) {
      return;
    }
    
    if (isEASV2Enabled) {
      router.push("/create");
    } else {
      setOpen(true);
    }
  };

  const handleCreateTempCheck = async () => {
    const loggedIn = await requireLogin();
    if (!loggedIn) {
      return;
    }

    if (topicContext) {
      const params = new URLSearchParams({
        type: "tempcheck",
        fromTopicId: topicContext.id.toString(),
        title: topicContext.title,
        description: topicContext.content,
        ...(topicContext.createdAt && { createdAt: topicContext.createdAt }),
        ...(topicContext.commentsCount !== undefined && { commentsCount: topicContext.commentsCount.toString() }),
      });
      router.push(`/create?${params.toString()}`);
    }
  };

  const handleCreateGovProposal = async () => {
    const loggedIn = await requireLogin();
    if (!loggedIn) {
      return;
    }

    if (topicContext) {
      const params = new URLSearchParams({
        type: "gov-proposal",
        fromTempCheckId: topicContext.id.toString(),
        title: topicContext.title,
        description: topicContext.content,
        ...(topicContext.createdAt && { createdAt: topicContext.createdAt }),
        ...(topicContext.commentsCount !== undefined && { commentsCount: topicContext.commentsCount.toString() }),
      });
      router.push(`/create?${params.toString()}`);
    }
  };

  //Todo: the colors for syndicate and towns need to be chagned in theme. cant make it conhesive with other tenants atm
  const bgStyle =
    namespace === TENANT_NAMESPACES.SYNDICATE
      ? "bg-white"
      : "bg-buttonBackground";
  const textStyle =
    namespace === TENANT_NAMESPACES.SYNDICATE ||
    namespace === TENANT_NAMESPACES.TOWNS
      ? "text-primary"
      : "text-neutral";

  if (isEASV2Enabled && topicContext) {
    return (
      <div className="flex gap-2">
        {!topicContext.isTempCheck && (
          <Button
            onClick={handleCreateTempCheck}
            size="lg"
          >
            Create temp check
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={handleClick}
        className={`inline-flex h-9 px-4 py-2 items-center justify-center gap-2 shrink-0 rounded-md ${bgStyle} shadow-sm hover:bg-hoverBackground text-sm h-auto ${textStyle}`}
      >
        {isDuna ? "+ Discuss DUNA" : isEASV2Enabled ? "+ Create" : "+ New Topic"}
      </Button>

      {!isEASV2Enabled && (
        <CreateTopicModal isOpen={open} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
