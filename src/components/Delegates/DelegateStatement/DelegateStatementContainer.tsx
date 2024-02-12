"use client";

import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import DelegateStatement from "./DelegateStatement";
import { DelegateStatement as DelegateStatementType } from "@/app/api/common/delegateStatement/delegateStatement";

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
        <div className="p-8 align-middle text-center rounded-md bg-gray-100">
          <p className="break-words">
            No delegate statement for {addressOrENSName}
          </p>
          {isConnected && address === addressOrENSName && (
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
