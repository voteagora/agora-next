import { getBlockScanUrl } from "@/lib/utils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

export default function BlockScanUrls({
  hash1,
  hash2,
  className,
  isEas,
}: {
  hash1: string | undefined | null;
  hash2?: string | undefined | null;
  className?: string | undefined;
  isEas?: boolean;
}) {
  // Shouldn't happen, but just in case
  if (!hash1 && !hash2) {
    return null;
  }

  return (
    <div className={cn("pt-4 text-xs text-secondary", className)}>
      {hash2 && hash1 ? (
        <div className="flex items-center">
          <a
            href={getBlockScanUrl(hash1, isEas)}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-center hover:underline"
          >
            <p>View transaction 1</p>
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
          </a>
          <a
            href={getBlockScanUrl(hash2, isEas)}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-center hover:underline"
          >
            <p>View transaction 2</p>
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
          </a>
        </div>
      ) : (
        <a
          href={getBlockScanUrl(hash1 || hash2 || "", isEas)}
          target="_blank"
          rel="noreferrer noopener"
          className="flex flex-row items-center w-full hover:underline"
        >
          <p>View transaction on block explorer</p>
          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
        </a>
      )}
    </div>
  );
}
