export function VotingProcessSection() {
  return (
    <section className="mt-12 scroll-mt-24 flex flex-col space-y-4">
      <h2 id="voting-process" className="text-2xl font-black text-primary">
        Voting Process
      </h2>
      <div className="rounded-xl border border-line bg-white shadow-sm p-6 space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-primary">
            How a proposal moves
          </h3>
          <div className="space-y-3 text-secondary text-sm leading-relaxed">
            <p>
              A Governance Proposal begins as a Temp-Check—a five-day signal
              where Members indicate support with their SYND. Advancing to a
              full vote requires at least 5% of SYND in circulation (subject to
              Article 13).
            </p>
            <p>
              If the Temp-Check passes, the proposal opens for a seven-day vote.
              It succeeds when a majority votes in favor and at least 10% of
              SYND in circulation participates. It fails if the majority votes
              against or participation stays below 10%.
            </p>
          </div>
          <h3 className="text-lg font-bold text-primary">
            Safeguards and enactment
          </h3>
          <div className="space-y-3 text-secondary text-sm leading-relaxed">
            <p>
              Within three days of passage, the Rules Committee can revert the
              proposal for legal, technical, or malicious issues under Article
              14. If there’s no reversion—or the committee affirms—the proposal
              is enacted.
            </p>
            <p>
              Once enacted, any fund recipients must complete tax reporting
              intake via the Rules Committee Administrator within 15 days. If
              that window closes without submission, payment expires unless a
              future Governance Proposal reauthorizes it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DelegationAndVotingPowerSection() {
  return (
    <section className="mt-12 scroll-mt-24 flex flex-col space-y-4">
      <h2 id="delegation" className="text-2xl font-black text-primary">
        Delegation & Voting Power
      </h2>
      <div className="rounded-xl border border-line bg-white shadow-sm p-6 space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-primary">
            How delegation works
          </h3>
          <div className="space-y-3 text-secondary text-sm leading-relaxed">
            <p>
              SYND uses ERC20Votes. Your tokens only count as votes after you
              delegate your voting power—either to yourself to vote directly or
              to a trusted member who can vote on your behalf.
            </p>
            <p>
              Self-delegate once per address and per chain (onchain call:
              delegate(0xYOUR-WALLET-HERE)) and your votes will automatically
              track your SYND balance. You can redelegate at any time if you
              later appoint a representative.
            </p>
            <p>
              Delegating points your voting power without transferring token
              ownership or your membership. Under Wyoming&apos;s DUNA framework,
              you stay a member; delegation authorizes another address to cast
              votes using your voting power, and you can revoke or change that
              delegation at any time.
            </p>
          </div>
          <h3 className="text-lg font-bold text-primary">Staying in control</h3>
          <div className="space-y-3 text-secondary text-sm leading-relaxed">
            <p>
              Delegation keeps everyday transfers efficient while preserving
              reliable onchain snapshots of voting power. You always keep
              custody of SYND and can reclaim direct voting by self-delegating
              again. Choose delegates you trust; your voting power follows your
              most recent delegation and can be updated whenever needed.
            </p>
            <p>
              If you receive funds from an enacted proposal, any required tax
              reporting steps still apply to you as the member.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
