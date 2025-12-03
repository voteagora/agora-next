import React from "react";

export default function SyndicateGovernanceInfo() {
  return (
    <div className="flex flex-col gap-8 mt-8">
      {/* Delegation and Voting Power Section */}
      <section id="delegation-voting-power">
        <h3 className="text-2xl font-black text-primary mb-4">
          How voting power works
        </h3>
        <div className="rounded-xl border border-line shadow-sm bg-neutral p-6">
          <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
            <p>
              The SYND token uses OpenZeppelin&apos;s ERC20Votes. Your tokens
              don&apos;t count as votes until you choose where your voting power
              should live:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong className="text-primary">Self-delegate</strong> to vote
                directly from your own wallet.
              </li>
              <li>
                <strong className="text-primary">
                  Delegate to someone you trust
                </strong>{" "}
                so they can vote on your behalf.
              </li>
            </ul>
            <p>
              Either way, you keep full ownership of your tokens. Delegation{" "}
              <strong className="text-primary">does not</strong> let anyone move
              your tokens or claim them; it only points your voting power. You
              can change or revoke delegation at any time by making a new
              delegation.
            </p>

            <div className="pt-4 border-t border-line mt-4">
              <h4 className="text-base font-semibold text-primary mb-2">
                Why it&apos;s designed this way
              </h4>
              <p>
                This model keeps everyday transfers cheaper and lets governance
                use reliable onchain snapshots of voting power at specific
                blocks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Governance Voting Process Section */}
      <section id="governance-voting-process">
        <h3 className="text-2xl font-black text-primary mb-4">
          Voting process
        </h3>
        <div className="rounded-xl border border-line shadow-sm bg-neutral p-6">
          <div className="flex flex-col space-y-6 text-secondary text-sm leading-relaxed">
            {/* Temp-Check Phase */}
            <div id="governance-voting-process-tempcheck">
              <h4 className="text-base font-semibold text-primary mb-2">
                Temp-Check Phase
              </h4>
              <p>
                In order for a{" "}
                <strong className="text-primary">Governance Proposal</strong> to
                be enacted, it must first be submitted as a{" "}
                <strong className="text-primary">Temp-Check</strong>, which is a
                five-day period during which{" "}
                <strong className="text-primary">Members</strong> can utilize
                their SYND token to indicate support for a proposal. In order
                for a proposal to transition from a{" "}
                <strong className="text-primary">Temp-Check</strong> to a vote
                of the membership, the{" "}
                <strong className="text-primary">Temp-Check</strong> must attain
                the support of 5% of the SYND tokens in circulation, except as
                limited by Article 13 of the Association Agreement.
              </p>
            </div>

            {/* Governance Proposal Phase */}
            <div
              id="governance-voting-process-proposal"
              className="pt-4 border-t border-line"
            >
              <h4 className="text-base font-semibold text-primary mb-2">
                Governance Proposal Phase
              </h4>
              <p className="mb-3">
                Upon a successful{" "}
                <strong className="text-primary">Temp-Check</strong>, the{" "}
                <strong className="text-primary">Governance Proposal</strong>{" "}
                period is open for seven days, during which time{" "}
                <strong className="text-primary">Members</strong> can utilize
                their SYND token to affirm, deny, or participate without voting
                on the proposal. A proposal:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong className="text-primary">passes</strong> if the
                  majority of votes affirm the proposal and 10% of the SYND
                  tokens in circulation participate in the vote; and
                </li>
                <li>
                  <strong className="text-primary">fails</strong> if the
                  majority of votes deny the proposal or 10% of the SYND tokens
                  in circulation did not participate in the vote.
                </li>
              </ul>
            </div>

            {/* Rules Committee Review */}
            <div
              id="governance-voting-process-review"
              className="pt-4 border-t border-line"
            >
              <h4 className="text-base font-semibold text-primary mb-2">
                Rules Committee Review
              </h4>
              <p>
                A passed{" "}
                <strong className="text-primary">Governance Proposal</strong>{" "}
                can be reverted for further consideration and modification
                pursuant to Article 14 of the Association Agreement if it is
                determined by the{" "}
                <strong className="text-primary">Rules Committee</strong> within
                3-days of passage to be violative of legal requirements,
                technically unfeasible, or malicious. If the 3-day period
                expires without reversion or the{" "}
                <strong className="text-primary">Rules Committee</strong>{" "}
                affirms the{" "}
                <strong className="text-primary">Governance Proposal</strong>,
                it is enacted.
              </p>
            </div>

            {/* Tax Reporting Requirements */}
            <div
              id="governance-voting-process-tax"
              className="pt-4 border-t border-line"
            >
              <h4 className="text-base font-semibold text-primary mb-2">
                Tax Reporting Requirements
              </h4>
              <p>
                Upon enactment of a{" "}
                <strong className="text-primary">Governance Proposal</strong>,
                any recipients of funds must complete a tax reporting intake
                through tooling provided by the{" "}
                <strong className="text-primary">
                  Rules Committee Administrator
                </strong>{" "}
                within 15 days, or the payment will expire, and the recipient
                shall not be eligible to receive the funds absent future{" "}
                <strong className="text-primary">Governance Proposal</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
