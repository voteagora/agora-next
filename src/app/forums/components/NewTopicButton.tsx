"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import CreateTopicModal from "./CreateTopicModal";

export default function NewTopicButton({ isDuna }: { isDuna: boolean }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 px-4 py-2 items-center justify-center gap-2 shrink-0 rounded-md bg-brandPrimary text-neutral shadow-sm hover:bg-neutral-800 text-sm h-auto"
      >
        {isDuna ? "+ Discuss DUNA" : "+ New Topic"}
      </Button>

      <CreateTopicModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
