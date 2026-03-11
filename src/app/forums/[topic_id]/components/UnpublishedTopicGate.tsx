"use client";

import React, { useState } from "react";
import { verifyUnpublishedTopicPassword } from "@/lib/actions/forum/unpublishedTopic";
import toast from "react-hot-toast";

interface UnpublishedTopicGateProps {
  redirectPath: string;
}

export default function UnpublishedTopicGate({
  redirectPath,
}: UnpublishedTopicGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await verifyUnpublishedTopicPassword(
        password,
        redirectPath
      );
      if (result?.error) {
        setError(result.error);
      } else {
        toast.success("Access granted, redirecting...");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border border-line rounded-lg bg-wash">
      <h2 className="text-lg font-semibold text-primary mb-2">
        This topic is not published yet
      </h2>
      <p className="text-sm text-secondary mb-4">
        Enter the preview password to view it.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 border border-input rounded-md bg-wash text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
          disabled={pending}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={pending || !password.trim()}
          className="w-full py-2 px-4 bg-neutral text-primary text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Checking…" : "View topic"}
        </button>
      </form>
    </div>
  );
}
