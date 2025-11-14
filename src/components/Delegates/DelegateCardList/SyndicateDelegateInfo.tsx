"use client";

import { useAccount } from "wagmi";
import { useProfileData } from "@/hooks/useProfileData";
import { DelegateToSelf } from "../Delegations/DelegateToSelf";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import Tenant from "@/lib/tenant/tenant";

export function SyndicateDelegateInfo() {
  const { address } = useAccount();
  const { delegate } = useProfileData();
  const { ui } = Tenant.current();
  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  const selfDelegate: DelegateChunk | null = delegate
    ? {
        address: delegate.address,
        votingPower: delegate.votingPower,
        statement: delegate.statement,
        participation: delegate.participation,
      }
    : address
      ? {
          address: address,
          votingPower: { total: "0", direct: "0", advanced: "0" },
          statement: null,
          participation: 0,
        }
      : null;

  return (
    <div className="flex flex-col space-y-8 mb-8">
      <div
        className={`flex flex-col space-y-4 p-6 ${useNeutral ? "bg-neutral" : "bg-wash"} border border-line shadow-newDefault rounded-xl`}
      >
        <h2 className="text-lg font-bold text-primary">Self-Delegation</h2>
        <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
          <p>
            Self-delegating activates your voting power so you can vote directly
            in onchain proposals.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
            <li>
              Onchain action: Call delegate(
              {address ? (
                <span className="font-mono">{address}</span>
              ) : (
                "0xYOUR-WALLET-HERE"
              )}
              ).
            </li>
            <li>
              After this one-time step (per address, per chain), your votes will
              track your token balance automatically. No need to repeat unless
              you later delegate to someone else.
            </li>
          </ul>
          <div className="flex flex-col space-y-2">
            <p className="font-medium">Vote directly from your wallet</p>
            {address && (
              <p className="text-primary font-mono text-sm">
                Your wallet: {address}
              </p>
            )}
          </div>
          {selfDelegate && (
            <div className="pt-2">
              <DelegateToSelf delegate={selfDelegate} />
            </div>
          )}
        </div>
      </div>

      <div
        className={`flex flex-col space-y-4 p-6 ${useNeutral ? "bg-neutral" : "bg-wash"} border border-line shadow-newDefault rounded-xl`}
      >
        <h2 className="text-lg font-bold text-primary">
          Delegate to Other Members
        </h2>
        <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
          <p>
            You can point your voting power to a trusted delegate. This helps
            active representatives vote on your behalf while{" "}
            <strong>you retain token ownership</strong> and can re-delegate at
            any time.
          </p>
          <p>
            <strong>You are still a member of the WY DUNA.</strong>
          </p>
          <p>
            Under Wyoming&apos;s Decentralized Unincorporated Nonprofit
            Association Act, a <strong>member</strong> is someone who may
            participate in selecting administrators or shaping policies. A{" "}
            <strong>membership interest</strong> is the voting right defined by
            those principles, and the Act explicitly contemplates that voting
            can be administered by smart contracts. Delegating your votes{" "}
            <strong>does not transfer your tokens</strong> or your membership;
            it only authorizes another address to cast votes using your voting
            power.
          </p>
        </div>
      </div>
    </div>
  );
}
