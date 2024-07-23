import { getBlockScanUrl } from "@/lib/utils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";

export default function BlockScanUrls({
  hash1,
  hash2,
  className,
}: {
  hash1: string | undefined;
  hash2?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <div className={cn("pt-4 text-xs text-secondary", className)}>
      {hash2 && hash1 ? (
        <div className="flex items-center justify-between">
          <a
            href={getBlockScanUrl(hash1)}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-center hover:underline"
          >
            <p>View transaction 1</p>
            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
          </a>
          <a
            href={getBlockScanUrl(hash2)}
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
          href={getBlockScanUrl(hash1 || hash2 || "")}
          target="_blank"
          rel="noreferrer noopener"
          className="flex flex-row items-center justify-between w-full hover:underline"
        >
          <p>View transaction on block explorer</p>
          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2" />
        </a>
      )}
    </div>
  );
}
