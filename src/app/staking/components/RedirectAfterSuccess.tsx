import Link from "next/link";
import { useEffect, useState } from "react";
import { INDEXER_DELAY } from "@/lib/constants";

interface RedirectAfterDelayProps {
  message: string;
  linkURI: string;
  linkTitle: string;
  refreshPath?: (path: string) => void;
}

export const RedirectAfterSuccess = ({
  message,
  linkURI,
  linkTitle,
  refreshPath,
}: RedirectAfterDelayProps) => {
  const [isIndexing, setIsIndexing] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      refreshPath?.(linkURI);
      setIsIndexing(false);
    }, INDEXER_DELAY);
  }, []);

  return (
    <div className="rounded-lg bg-green-200 border border-green-300 p-4">
      <div className="text-sm font-semibold">{message}</div>
      <div className="text-sm text-gray-700">
        {isIndexing ? (
          "Indexing transaction..."
        ) : (
          <Link className="underline" href={linkURI}>
            {linkTitle}
          </Link>
        )}
      </div>
    </div>
  );
};
