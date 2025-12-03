import { Vote, Users, UserCheck, UserPlus, Shield } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help - How Syndicate Governance Works",
  description:
    "Everything you need to know about voting, delegation, and participating in Syndicate Network Collective governance.",
};

export default function HelpPage() {
  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <div className="bg-wash border-b border-line py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            How Syndicate Governance Works
          </h1>
          <p className="text-lg text-secondary">
            Everything you need to know about voting, delegation, and
            participating in Syndicate Network Collective governance.
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col space-y-16">
          {/* Voting Process Section */}
          <section id="voting-process" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Vote className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                Voting Process
              </h2>
            </div>
            <div className="bg-neutral border border-line shadow-newDefault rounded-xl p-8">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-bold text-primary mb-4">
                  Governance Proposal Lifecycle
                </h3>
                <ul className="list-disc list-outside space-y-4 text-secondary text-sm leading-relaxed ml-6">
                  <li>
                    In order for a <strong>Governance Proposal</strong> to be
                    enacted, it must:
                    <ul className="list-[circle] list-outside space-y-3 ml-6 mt-3 text-sm leading-relaxed">
                      <li>
                        first be submitted as a <strong>Temp-Check</strong>,
                        which is a five-day period during which{" "}
                        <strong>Members</strong> can utilize their SYND token to
                        indicate support for a proposal. In order for a proposal
                        to transition from a <strong>Temp-Check</strong> to a
                        vote of the membership, the <strong>Temp-Check</strong>{" "}
                        must attain the support of 5% of the SYND tokens in
                        circulation, except as limited by Article 13 of the
                        Association Agreement.
                      </li>
                      <li>
                        upon a successful <strong>Temp-Check</strong>, the{" "}
                        <strong>Governance Proposal</strong> period is open for
                        seven days, during which time
                        <strong> Members</strong> can utilize their SYND token
                        to affirm, deny, or participate without voting on the
                        proposal. A proposal:
                        <ul className="list-[square] list-outside space-y-2 ml-6 mt-2 text-sm leading-relaxed">
                          <li>
                            <strong>passes</strong> if the majority of votes
                            affirm the proposal and 10% of the SYND tokens in
                            circulation participate in the vote; and
                          </li>
                          <li>
                            <strong>fails</strong> if the majority of votes deny
                            the proposal or 10% of the SYND tokens in
                            circulation did not participate in the vote.
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>
                    A passed <strong>Governance Proposal</strong> can be
                    reverted for further consideration and modification pursuant
                    to Article 14 of the Association Agreement if it is
                    determined by the <strong>Rules Committee</strong> within
                    3-days of passage to be violative of legal requirements,
                    technically unfeasible, or malicious. If the 3-day period
                    expires without reversion or the{" "}
                    <strong>Rules Committee</strong> affirms the{" "}
                    <strong>Governance Proposal</strong>, it is enacted.
                  </li>
                  <li>
                    Upon enactment of a <strong>Governance Proposal</strong>,
                    any recipients of funds must complete a tax reporting intake
                    through tooling provided by the
                    <strong> Rules Committee Administrator</strong> within 15
                    days, or the payment will expire, and the recipient shall
                    not be eligible to receive the funds absent future{" "}
                    <strong>Governance Proposal</strong>.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Voting Power Section */}
          <section id="voting-power" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                Voting Power & Delegation
              </h2>
            </div>
            <div className="bg-neutral border border-line shadow-newDefault rounded-xl p-8">
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-bold text-primary mb-4">
                  How voting power works:
                </h3>
                <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
                  <p>
                    The SYND token uses OpenZeppelin&apos;s ERC20Votes. Your
                    tokens don&apos;t count as votes until you choose where your
                    voting power should live:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                    <li>
                      <strong>Self-delegate</strong> to vote directly from your
                      own wallet.
                    </li>
                    <li>
                      <strong>Delegate to someone you trust</strong> so they can
                      vote on your behalf.
                    </li>
                  </ul>
                  <p>
                    Either way, you keep full ownership of your tokens.
                    Delegation <strong>does not</strong> let anyone move your
                    tokens or claim them; it only points your voting power. You
                    can change or revoke delegation at any time by making a new
                    delegation.
                  </p>
                </div>

                <h3 className="text-lg font-bold text-primary mt-8 mb-4">
                  Why it&apos;s designed this way:
                </h3>
                <p className="text-secondary text-sm leading-relaxed">
                  This model keeps everyday transfers cheaper and lets
                  governance use reliable onchain snapshots of voting power at
                  specific blocks.
                </p>
              </div>
            </div>
          </section>

          {/* Self-Delegation Section */}
          <section id="self-delegation" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                Self-Delegation
              </h2>
            </div>
            <div className="bg-neutral border border-line shadow-newDefault rounded-xl p-8">
              <div className="prose prose-sm max-w-none">
                <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
                  <p>
                    Self-delegating activates your voting power so you can vote
                    directly in onchain proposals.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                    <li>Onchain action: Call delegate(0xYOUR-WALLET-HERE).</li>
                    <li>
                      After this one-time step (per address, per chain), your
                      votes will track your token balance automatically. No need
                      to repeat unless you later delegate to someone else.
                    </li>
                  </ul>
                  <div className="flex flex-col space-y-2 mt-4">
                    <p className="font-medium text-primary">
                      Vote directly from your wallet
                    </p>
                    <p className="text-secondary">
                      Connect your wallet on the Voters page to self-delegate
                      and activate your voting power.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Delegate to Others Section */}
          <section id="delegate-to-others" className="scroll-mt-8">
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">
                Delegate to Other Members
              </h2>
            </div>
            <div className="bg-neutral border border-line shadow-newDefault rounded-xl p-8">
              <div className="prose prose-sm max-w-none">
                <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
                  <p>
                    You can point your voting power to a trusted delegate. This
                    helps active representatives vote on your behalf while{" "}
                    <strong>you retain token ownership</strong> and can
                    re-delegate at any time.
                  </p>

                  <h3 className="text-lg font-bold text-primary mt-6 mb-3">
                    Wyoming DUNA Membership
                  </h3>
                  <p>
                    <strong>You are still a member of the WY DUNA.</strong>
                  </p>
                  <p>
                    Under Wyoming&apos;s Decentralized Unincorporated Nonprofit
                    Association Act, a <strong>member</strong> is someone who
                    may participate in selecting administrators or shaping
                    policies. A <strong>membership interest</strong> is the
                    voting right defined by those principles, and the Act
                    explicitly contemplates that voting can be administered by
                    smart contracts. Delegating your votes{" "}
                    <strong>does not transfer your tokens</strong> or your
                    membership; it only authorizes another address to cast votes
                    using your voting power.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
