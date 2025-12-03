import React from "react";
import { Vote, Coins, UserCheck, UserPlus } from "lucide-react";

function InfoSection({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-wash">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-primary">{title}</h3>
      </div>
      <div className="bg-neutral border border-line shadow-newDefault rounded-xl p-6">
        {children}
      </div>
    </section>
  );
}

export default function SyndicateInfoSections() {
  return (
    <div className="flex flex-col gap-8 mt-8">
      {/* Voting Process Section */}
      <InfoSection id="voting-process" title="Voting Process" icon={Vote}>
        <ul className="list-disc list-outside space-y-3 text-secondary text-sm leading-relaxed ml-6">
          <li>
            In order for a{" "}
            <strong className="text-primary">Governance Proposal</strong> to be
            enacted, it must:
            <ul className="list-[circle] list-outside space-y-2 ml-6 mt-2">
              <li>
                First be submitted as a{" "}
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
              </li>
              <li>
                Upon a successful{" "}
                <strong className="text-primary">Temp-Check</strong>, the{" "}
                <strong className="text-primary">Governance Proposal</strong>{" "}
                period is open for seven days, during which time{" "}
                <strong className="text-primary">Members</strong> can utilize
                their SYND token to affirm, deny, or participate without voting
                on the proposal. A proposal:
                <ul className="list-[square] list-outside space-y-1 ml-6 mt-2">
                  <li>
                    <strong className="text-primary">passes</strong> if the
                    majority of votes affirm the proposal and 10% of the SYND
                    tokens in circulation participate in the vote; and
                  </li>
                  <li>
                    <strong className="text-primary">fails</strong> if the
                    majority of votes deny the proposal or 10% of the SYND
                    tokens in circulation did not participate in the vote.
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            A passed{" "}
            <strong className="text-primary">Governance Proposal</strong> can be
            reverted for further consideration and modification pursuant to
            Article 14 of the Association Agreement if it is determined by the{" "}
            <strong className="text-primary">Rules Committee</strong> within
            3-days of passage to be violative of legal requirements, technically
            unfeasible, or malicious. If the 3-day period expires without
            reversion or the{" "}
            <strong className="text-primary">Rules Committee</strong> affirms
            the <strong className="text-primary">Governance Proposal</strong>,
            it is enacted.
          </li>
          <li>
            Upon enactment of a{" "}
            <strong className="text-primary">Governance Proposal</strong>, any
            recipients of funds must complete a tax reporting intake through
            tooling provided by the{" "}
            <strong className="text-primary">
              Rules Committee Administrator
            </strong>{" "}
            within 15 days, or the payment will expire, and the recipient shall
            not be eligible to receive the funds absent future{" "}
            <strong className="text-primary">Governance Proposal</strong>.
          </li>
        </ul>
      </InfoSection>

      {/* How Voting Power Works Section */}
      <InfoSection
        id="voting-power"
        title="How Voting Power Works"
        icon={Coins}
      >
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
            your tokens or claim them; it only points your voting power. You can
            change or revoke delegation at any time by making a new delegation.
          </p>
          <div className="pt-2 border-t border-line mt-4">
            <h4 className="text-base font-semibold text-primary mb-2">
              Why it&apos;s designed this way
            </h4>
            <p>
              This model keeps everyday transfers cheaper and lets governance
              use reliable onchain snapshots of voting power at specific blocks.
            </p>
          </div>
        </div>
      </InfoSection>

      {/* Self-Delegation Section */}
      <InfoSection
        id="self-delegation"
        title="Self-Delegation"
        icon={UserCheck}
      >
        <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
          <p>
            Self-delegating activates your voting power so you can vote directly
            in onchain proposals.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-primary">Onchain action:</strong> Call
              delegate(0xYOUR-WALLET-HERE).
            </li>
            <li>
              After this one-time step (per address, per chain), your votes will
              track your token balance automatically. No need to repeat unless
              you later delegate to someone else.
            </li>
          </ul>
          <p className="font-medium text-primary">
            You can self-delegate from the Delegates page by clicking the
            &quot;Delegate to self&quot; button.
          </p>
        </div>
      </InfoSection>

      {/* Delegate to Other Members Section */}
      <InfoSection
        id="delegate-to-others"
        title="Delegate to Other Members"
        icon={UserPlus}
      >
        <div className="flex flex-col space-y-4 text-secondary text-sm leading-relaxed">
          <p>
            You can point your voting power to a trusted delegate. This helps
            active representatives vote on your behalf while{" "}
            <strong className="text-primary">you retain token ownership</strong>{" "}
            and can re-delegate at any time.
          </p>
          <div className="p-4 bg-wash rounded-lg border border-line">
            <p className="font-semibold text-primary mb-2">
              You are still a member of the WY DUNA.
            </p>
            <p className="text-xs">
              Under Wyoming&apos;s Decentralized Unincorporated Nonprofit
              Association Act, a <strong>member</strong> is someone who may
              participate in selecting administrators or shaping policies. A{" "}
              <strong>membership interest</strong> is the voting right defined
              by those principles, and the Act explicitly contemplates that
              voting can be administered by smart contracts. Delegating your
              votes <strong>does not transfer your tokens</strong> or your
              membership; it only authorizes another address to cast votes using
              your voting power.
            </p>
          </div>
        </div>
      </InfoSection>
    </div>
  );
}
