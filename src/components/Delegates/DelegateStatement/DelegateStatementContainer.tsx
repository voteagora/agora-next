"use client";

import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import DelegateStatement from "./DelegateStatement";
import { Delegate } from "@/app/api/common/delegates/delegate";

interface Props {
  delegate: Delegate;
}

export default function DelegateStatementContainer({ delegate }: Props) {
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();

  const delegateStatement = (
    delegate?.statement?.payload as { delegateStatement: string }
  )?.delegateStatement;

  const searchParams = useSearchParams();
  const dssave = searchParams ? searchParams.get("dssave") : null;
  const showSuccessMessage = dssave === "true";

  return (
    <>
      {showSuccessMessage && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4"
          role="alert"
        >
          <p className="font-bold">Statement Saved</p>
          <p>Nice! Thank you for telling the community what you believe in.</p>
        </div>
      )}
      {!delegateStatement && (
        <div className="p-8 text-center text-secondary align-middle bg-wash rounded-xl">
          <p className="break-words">
            No delegate statement for {delegate.address}
          </p>
          {isConnected && address === delegate.address && (
            <p className="my-3">
              <a
                rel="noopener"
                target="_blank"
                className="underline"
                href="/delegates/create"
              >
                Create your delegate statement
              </a>
            </p>
          )}
        </div>
      )}

      {delegateStatement && <DelegateStatement statement={delegateStatement} />}
    </>
  );
}
