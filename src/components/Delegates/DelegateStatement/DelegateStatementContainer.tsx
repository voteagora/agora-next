"use client";

import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import DelegateStatement from "./DelegateStatement";
import { type DelegateStatement as DelegateStatementType } from "@/app/api/delegateStatement/delegateStatement";

export default function DelegateStatementContainer({
  addressOrENSName,
  statement,
}: {
  addressOrENSName: string;
  statement: DelegateStatementType | null;
}) {
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();

  const delegateStatement = (
    statement?.payload as { delegateStatement: string }
  ).delegateStatement;

  return (
    <>
      {!delegateStatement && (
        <div className="mb-8 p-8 align-middle text-center rounded-md bg-gray-100">
          <p>No delegate statement for {addressOrENSName}.</p>
          {isConnected && address === addressOrENSName && (
            <p className="my-3">
              <a
                rel="noopener"
                target="_blank"
                className="underline"
                href="https://vote.optimism.io/create"
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
