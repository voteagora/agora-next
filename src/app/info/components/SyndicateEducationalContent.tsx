"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-neutral border border-line shadow-newDefault rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-wash/50 transition-colors text-left"
      >
        <h3 className="text-base font-semibold text-primary">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-secondary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-secondary" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0">{children}</div>
      )}
    </div>
  );
}

export default function SyndicateEducationalContent() {
  return (
    <div id="voting-guide" className="flex flex-col gap-6 my-8 scroll-mt-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-primary">
          Voting & Delegation Guide
        </h2>
        <p className="text-secondary text-sm">
          Learn how voting power and governance proposals work in the Syndicate
          Network Collective.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <AccordionSection title="How Voting Power Works" defaultOpen={true}>
          <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
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
            <p className="text-xs text-tertiary italic">
              This model keeps everyday transfers cheaper and lets governance
              use reliable onchain snapshots of voting power at specific blocks.
            </p>
          </div>
        </AccordionSection>

        <AccordionSection title="Governance Proposal Voting Process">
          <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
            <p>
              In order for a <strong>Governance Proposal</strong> to be enacted,
              it must go through the following process:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brandPrimary/10 text-brandPrimary text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <div>
                  <p className="font-medium text-primary">
                    Temp-Check (5 days)
                  </p>
                  <p className="text-sm">
                    Members utilize their SYND token to indicate support for a
                    proposal. The Temp-Check must attain the support of{" "}
                    <strong>5% of the SYND tokens</strong> in circulation to
                    proceed, except as limited by Article 13 of the Association
                    Agreement.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brandPrimary/10 text-brandPrimary text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <div>
                  <p className="font-medium text-primary">
                    Governance Proposal Vote (7 days)
                  </p>
                  <p className="text-sm">
                    Members can utilize their SYND token to affirm, deny, or
                    participate without voting on the proposal.
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>
                      <strong>Passes:</strong> Majority of votes affirm the
                      proposal AND 10% of SYND tokens in circulation participate
                    </li>
                    <li>
                      <strong>Fails:</strong> Majority of votes deny the
                      proposal OR less than 10% participation
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brandPrimary/10 text-brandPrimary text-xs font-bold flex items-center justify-center">
                  3
                </div>
                <div>
                  <p className="font-medium text-primary">
                    Rules Committee Review (3 days)
                  </p>
                  <p className="text-sm">
                    A passed proposal can be reverted for further consideration
                    if the Rules Committee determines it to be violative of
                    legal requirements, technically unfeasible, or malicious. If
                    the 3-day period expires without reversion or the Rules
                    Committee affirms, the proposal is enacted.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brandPrimary/10 text-brandPrimary text-xs font-bold flex items-center justify-center">
                  4
                </div>
                <div>
                  <p className="font-medium text-primary">
                    Tax Reporting (15 days)
                  </p>
                  <p className="text-sm">
                    Upon enactment, any recipients of funds must complete a tax
                    reporting intake through tooling provided by the Rules
                    Committee Administrator within 15 days, or the payment will
                    expire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection title="Self-Delegation">
          <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
            <p>
              Self-delegating activates your voting power so you can vote
              directly in onchain proposals.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
              <li>
                <strong>Onchain action:</strong> Call{" "}
                <code className="bg-wash px-1 py-0.5 rounded text-xs">
                  delegate(YOUR_WALLET_ADDRESS)
                </code>
              </li>
              <li>
                After this one-time step (per address, per chain), your votes
                will track your token balance automatically. No need to repeat
                unless you later delegate to someone else.
              </li>
            </ul>
            <p className="text-xs text-tertiary">
              You can self-delegate from the Voters page by clicking the
              &quot;Delegate to self&quot; button.
            </p>
          </div>
        </AccordionSection>

        <AccordionSection title="Delegating to Other Members">
          <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
            <p>
              You can point your voting power to a trusted delegate. This helps
              active representatives vote on your behalf while{" "}
              <strong>you retain token ownership</strong> and can re-delegate at
              any time.
            </p>
            <div className="bg-wash p-3 rounded-lg border border-line">
              <p className="font-medium text-primary text-sm">
                You are still a member of the WY DUNA.
              </p>
              <p className="text-xs mt-2">
                Under Wyoming&apos;s Decentralized Unincorporated Nonprofit
                Association Act, a <strong>member</strong> is someone who may
                participate in selecting administrators or shaping policies. A{" "}
                <strong>membership interest</strong> is the voting right defined
                by those principles. Delegating your votes{" "}
                <strong>does not transfer your tokens</strong> or your
                membership; it only authorizes another address to cast votes
                using your voting power.
              </p>
            </div>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}
