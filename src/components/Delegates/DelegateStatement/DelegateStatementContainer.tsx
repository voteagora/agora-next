"use client";

import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
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

  return (
    <>
      {!delegateStatement && (
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-primary">
            Delegate Statement
          </h2>
          <p className="break-words p-8 text-center text-secondary align-middle bg-wash rounded-xl shadow-newDefault border border-line">
            No delegate statement for {delegate.address}
          </p>
          {isConnected && address === delegate.address && (
            <p className="my-3">
              <span className="underline">
                Contact the administrator to create your delegate statement
              </span>
            </p>
          )}
        </div>
      )}

      {delegateStatement && <DelegateStatement statement={delegateStatement} />}
    </>
  );
}
