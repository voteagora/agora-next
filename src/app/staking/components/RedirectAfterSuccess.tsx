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
    <div className="rounded-lg bg-positive/10 border border-positive p-4">
      <div className="text-sm font-semibold text-positive">{message}</div>
      <div className="text-sm text-primary">
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
