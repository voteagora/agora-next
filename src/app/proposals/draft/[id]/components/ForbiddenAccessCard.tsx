"use client";

import Link from "next/link";
import { UpdatedButton } from "@/components/Button";

export function ForbiddenAccessCard({ message }: { message?: string | null }) {
  return (
    <div className="bg-wash border border-line rounded-2xl shadow-newDefault p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-primary text-xl font-black">Access denied</h2>
          <p className="text-secondary mt-2 max-w-prose">
            {message || "You are not the owner of this draft."}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Link href="/" className="sm:w-auto">
          <UpdatedButton type="primary">Back to Home</UpdatedButton>
        </Link>
      </div>
    </div>
  );
}

export default ForbiddenAccessCard;
