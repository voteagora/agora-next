"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ChatPanel from "./ChatPanel";

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`fixed bottom-4 right-4 z-[1001] inline-flex items-center justify-center rounded-full h-12 w-12 bg-primary text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity duration-200 ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        onKeyDown={(e) => e.stopPropagation()}
        aria-label={open ? "Close governance chat" : "Open governance chat"}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
      <ChatPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
