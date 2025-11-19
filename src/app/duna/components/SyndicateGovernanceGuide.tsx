import React from "react";

export default function SyndicateGovernanceGuide() {
  return (
    <div className="flex flex-col space-y-8 mt-12">
      {/* Voting Process Section */}
      <div
        id="voting-process"
        className="scroll-mt-16 bg-neutral border border-line shadow-newDefault rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-primary mb-6">
          Voting Process
        </h2>

        <div className="space-y-6">
          {/* Temp-Check */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              1. Temp-Check (5 days)
            </h3>
            <div className="text-secondary text-sm leading-relaxed space-y-2">
              <p>
                Before a Governance Proposal can be enacted, it must first be
                submitted as a Temp-Check—a five-day period where Members use
                their SYND token to indicate support.
              </p>
              <p>
                To advance to a Member Vote, the Temp-Check must attain support
                from 5% of SYND tokens in circulation (subject to Article 13 of
                the Association Agreement).
              </p>
            </div>
          </div>

          {/* Member Vote */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              2. Member Vote (7 days)
            </h3>
            <div className="text-secondary text-sm leading-relaxed space-y-2">
              <p>
                After a successful Temp-Check, the proposal enters a seven-day
                voting period where Members can affirm, deny, or abstain.
              </p>
              <p>
                A proposal passes if it receives majority support and 10% of
                SYND tokens participate. It fails if denied by the majority or
                if participation falls below 10%.
              </p>
            </div>
          </div>

          {/* Execution */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              3. Rules Committee Review & Execution
            </h3>
            <div className="text-secondary text-sm leading-relaxed space-y-2">
              <p>
                Within 3 days of passage, the Rules Committee may revert a
                proposal if it violates legal requirements, is technically
                unfeasible, or is malicious (per Article 14 of the Association
                Agreement).
              </p>
              <p>
                If the 3-day period expires without reversion, the proposal is
                enacted. Fund recipients must complete tax reporting intake
                within 15 days or forfeit payment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How Voting Power Works Section */}
      <div
        id="voting-power"
        className="scroll-mt-16 bg-neutral border border-line shadow-newDefault rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-primary mb-4">
          How Voting Power Works
        </h2>

        <div className="text-secondary text-sm leading-relaxed space-y-3">
          <p>
            The SYND token uses OpenZeppelin's ERC20Votes. Your tokens don't
            count as votes until you choose where your voting power lives: you
            can self-delegate to vote from your own wallet, or delegate to
            someone you trust so they can vote on your behalf.
          </p>

          <p>
            Either way, you keep full ownership of your tokens. Delegation only
            points your voting power—it doesn't let anyone move or claim your
            tokens. You can change or revoke delegation at any time.
          </p>

          <div className="mt-4 pt-4 border-t border-line">
            <h3 className="text-sm font-semibold text-primary mb-2">
              Why it's designed this way
            </h3>
            <p className="text-xs text-tertiary">
              This model keeps everyday transfers cheaper and lets governance
              use reliable onchain snapshots of voting power at specific
              blocks.
            </p>
          </div>
        </div>
      </div>

      {/* Delegating to Others Section */}
      <div
        id="delegation"
        className="scroll-mt-16 bg-neutral border border-line shadow-newDefault rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-primary mb-4">
          Delegating to Others
        </h2>

        <div className="text-secondary text-sm leading-relaxed space-y-3">
          <p>
            You can point your voting power to a trusted delegate. This helps
            active representatives vote on your behalf while you retain full
            token ownership and can re-delegate at any time.
          </p>

          <div className="mt-4 pt-4 border-t border-line">
            <h3 className="text-sm font-semibold text-primary mb-2">
              You are still a member of the WY DUNA
            </h3>
            <p>
              Under Wyoming's Decentralized Unincorporated Nonprofit
              Association Act, a member is someone who may participate in
              selecting administrators or shaping policies. The Act explicitly
              contemplates that voting can be administered by smart contracts.
            </p>
            <p className="mt-2">
              Delegating your votes does not transfer your tokens or
              membership—it only authorizes another address to cast votes using
              your voting power.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

