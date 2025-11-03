"use client";

import Tenant from "@/lib/tenant/tenant";

export default function SyndicateVotersPageContent() {
  const { ui } = Tenant.current();
  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  return (
    <div
      className={`flex flex-col space-y-6 mb-8 p-6 ${useNeutral ? "bg-neutral" : "bg-wash"} border border-line shadow-newDefault rounded-xl`}
    >
      <div className="flex flex-col space-y-3">
        <h2 className="text-lg font-bold text-primary">
          How voting power works:
        </h2>
        <div className="flex flex-col space-y-3 text-secondary text-sm leading-relaxed">
          <p>
            The SYND token uses OpenZeppelin&apos;s ERC20Votes. Your tokens
            don&apos;t count as votes until you choose where your voting power
            should live:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
            <li>
              <strong>Self-delegate</strong> to vote directly from your own
              wallet.
            </li>
            <li>
              <strong>Delegate to someone you trust</strong> so they can vote on
              your behalf.
            </li>
          </ul>
          <p>
            Either way, you keep full ownership of your tokens. Delegation{" "}
            <strong>does not</strong> let anyone move your tokens or claim them;
            it only points your voting power. You can change or revoke
            delegation at any time by making a new delegation.
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-3">
        <h2 className="text-lg font-bold text-primary">
          Why it&apos;s designed this way:
        </h2>
        <p className="text-secondary text-sm leading-relaxed">
          This model keeps everyday transfers cheaper and lets governance use
          reliable onchain snapshots of voting power at specific blocks.
        </p>
      </div>

      {/* Voting process content moved to proposals page */}
    </div>
  );
}
