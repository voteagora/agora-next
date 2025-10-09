"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import CreateTopicModal from "./CreateTopicModal";
import useRequireLogin from "@/hooks/useRequireLogin";

export default function NewTopicButton({ isDuna }: { isDuna: boolean }) {
  const [open, setOpen] = React.useState(false);
  const requireLogin = useRequireLogin();

  const handleClick = async () => {
    const loggedIn = await requireLogin();
    if (!loggedIn) {
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className="inline-flex h-9 px-4 py-2 items-center justify-center gap-2 shrink-0 rounded-md bg-buttonBackground shadow-sm hover:bg-hoverBackground text-sm h-auto"
      >
        {isDuna ? "+ Discuss DUNA" : "+ New Topic"}
      </Button>

      <CreateTopicModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
