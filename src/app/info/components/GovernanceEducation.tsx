"use client";

export default function GovernanceEducation() {
  return (
    <div className="flex flex-col gap-8 mb-8">
      {/* Voting Process Section */}
      <div
        id="voting-process"
        className="flex flex-col space-y-3 bg-neutral border border-line shadow-newDefault rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-primary">Voting Process</h2>
        <ul className="list-disc list-outside space-y-2 text-secondary text-sm leading-relaxed ml-6">
          <li>
            In order for a <strong>Governance Proposal</strong> to be enacted,
            it must:
            <ul className="list-[circle] list-outside space-y-2 ml-6 mt-2 text-sm leading-relaxed">
              <li>
                first be submitted as a <strong>Temp-Check</strong>, which is a
                five-day period during which <strong>Members</strong> can
                utilize their SYND token to indicate support for a proposal. In
                order for a proposal to transition from a{" "}
                <strong>Temp-Check</strong> to a vote of the membership, the{" "}
                <strong>Temp-Check</strong> must attain the support of 5% of the
                SYND tokens in circulation, except as limited by Article 13 of
                the Association Agreement.
              </li>
              <li>
                upon a successful <strong>Temp-Check</strong>, the{" "}
                <strong>Governance Proposal</strong> period is open for seven
                days, during which time
                <strong> Members</strong> can utilize their SYND token to
                affirm, deny, or participate without voting on the proposal. A
                proposal:
                <ul className="list-[square] list-outside space-y-1 ml-6 mt-2 text-sm leading-relaxed">
                  <li>
                    <strong>passes</strong> if the majority of votes affirm the
                    proposal and 10% of the SYND tokens in circulation
                    participate in the vote; and
                  </li>
                  <li>
                    <strong>fails</strong> if the majority of votes deny the
                    proposal or 10% of the SYND tokens in circulation did not
                    participate in the vote.
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            A passed <strong>Governance Proposal</strong> can be reverted for
            further consideration and modification pursuant to Article 14 of the
            Association Agreement if it is determined by the{" "}
            <strong>Rules Committee</strong> within 3-days of passage to be
            violative of legal requirements, technically unfeasible, or
            malicious. If the 3-day period expires without reversion or the{" "}
            <strong>Rules Committee</strong> affirms the{" "}
            <strong>Governance Proposal</strong>, it is enacted.
          </li>
          <li>
            Upon enactment of a <strong>Governance Proposal</strong>, any
            recipients of funds must complete a tax reporting intake through
            tooling provided by the
            <strong> Rules Committee Administrator</strong> within 15 days, or
            the payment will expire, and the recipient shall not be eligible to
            receive the funds absent future <strong>Governance Proposal</strong>
            .
          </li>
        </ul>
      </div>

      {/* Delegation Section */}
      <div
        id="delegation"
        className="flex flex-col space-y-6 bg-neutral border border-line shadow-newDefault rounded-xl p-6"
      >
        <div className="flex flex-col space-y-3">
          <h2 className="text-2xl font-bold text-primary">
            How Voting Power Works
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
                <strong>Delegate to someone you trust</strong> so they can vote
                on your behalf.
              </li>
            </ul>
            <p>
              Either way, you keep full ownership of your tokens. Delegation{" "}
              <strong>does not</strong> let anyone move your tokens or claim
              them; it only points your voting power. You can change or revoke
              delegation at any time by making a new delegation.
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <h3 className="text-lg font-bold text-primary">
            Why It&apos;s Designed This Way
          </h3>
          <p className="text-secondary text-sm leading-relaxed">
            This model keeps everyday transfers cheaper and lets governance use
            reliable onchain snapshots of voting power at specific blocks.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <h3 className="text-lg font-bold text-primary">Self-Delegation</h3>
          <p className="text-secondary text-sm leading-relaxed">
            Self-delegating activates your voting power so you can vote directly
            in onchain proposals.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-sm text-secondary">
            <li>Onchain action: Call delegate(0xYOUR-WALLET-HERE).</li>
            <li>
              After this one-time step (per address, per chain), your votes will
              track your token balance automatically. No need to repeat unless
              you later delegate to someone else.
            </li>
          </ul>
        </div>

        <div className="flex flex-col space-y-3">
          <h3 className="text-lg font-bold text-primary">
            Delegate to Other Members
          </h3>
          <p className="text-secondary text-sm leading-relaxed">
            You can point your voting power to a trusted delegate. This helps
            active representatives vote on your behalf while{" "}
            <strong>you retain token ownership</strong> and can re-delegate at
            any time.
          </p>
          <p className="text-secondary text-sm leading-relaxed font-semibold">
            You are still a member of the WY DUNA.
          </p>
          <p className="text-secondary text-sm leading-relaxed">
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
