"use client";

import { useAccount } from "wagmi";

export default function DelegatingSectionContent() {
  const { address } = useAccount();

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h3 className="text-[15px] font-semibold text-primary">
          Self-Delegation:
        </h3>
        <div className="flex flex-col space-y-3">
          <p>
            Self-delegating activates your voting power so you can vote directly
            in onchain proposals.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
            <li>
              Onchain action: Call delegate(
              <span className="font-mono">
                {address || "0xYOUR-WALLET-HERE"}
              </span>
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
        </div>
      </div>

      <div className="flex flex-col space-y-3">
        <h3 className="text-[15px] font-semibold text-primary">
          Delegate to Other Members:
        </h3>
        <div className="flex flex-col space-y-3">
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
