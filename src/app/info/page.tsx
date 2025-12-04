// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import React from "react";
import InfoAbout from "@/app/info/components/InfoAbout";
import { InfoHero } from "@/app/info/components/InfoHero";

import { ChartTreasury } from "@/app/info/components/ChartTreasury";
import GovernorSettings from "@/app/info/components/GovernorSettings";
import GovernanceCharts from "@/app/info/components/GovernanceCharts";
import DunaAdministration from "@/app/duna/components/DunaAdministration";
import DunaDisclosures from "@/app/duna/components/DunaDisclosures";
import SyndicateDunaDisclosures from "@/app/duna/components/SyndicateDunaDisclosures";
import TownsDunaAdministration from "@/app/duna/components/TownsDunaAdministration";
import Tenant from "@/lib/tenant/tenant";
import { FREQUENCY_FILTERS, TENANT_NAMESPACES } from "@/lib/constants";
import { apiFetchTreasuryBalanceTS } from "@/app/api/balances/[frequency]/getTreasuryBalanceTS";
import { apiFetchDelegateWeights } from "@/app/api/analytics/top/delegates/getTopDelegateWeighs";
import { apiFetchProposalVoteCounts } from "@/app/api/analytics/vote/getProposalVoteCounts";
import { apiFetchMetricTS } from "@/app/api/analytics/metric/[metric_id]/[frequency]/getMetricsTS";
import Hero from "@/components/Hero/Hero";
import { getMetadataBaseUrl } from "@/app/lib/utils/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({}) {
  const tenant = Tenant.current();
  const page = tenant.ui.page("info") || tenant.ui.page("/");

  const { title, description } = page!.meta;
  const metadataBase = getMetadataBaseUrl();

  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

  return {
    metadataBase,
    title: title,
    description: description,
    openGraph: {
      type: "website",
      title: title,
      description: description,
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page() {
  const { ui, namespace } = Tenant.current();

  if (!ui.toggle("info")?.enabled) {
    return (
      <div className="text-primary">Route not supported for namespace</div>
    );
  }

  const hasGovernanceCharts =
    ui.toggle("info/governance-charts")?.enabled === true;
  const hasDunaAdministration = ui.toggle("duna")?.enabled === true;

  if (namespace !== TENANT_NAMESPACES.ETHERFI) {
    const treasuryData = await apiFetchTreasuryBalanceTS(
      FREQUENCY_FILTERS.YEAR
    );

    return (
      <div className="flex flex-col">
        <InfoHero />
        <InfoAbout />

        {/* Voting Process Section */}
        <div id="voting-process">
          <h3 className="text-2xl font-black text-primary mt-12">
            Voting Process
          </h3>
          <div className="mt-4 rounded-xl border border-line shadow-sm bg-infoSectionBackground">
            <div className="p-6">
              <h3 className="text-lg font-bold text-primary">
                Voting process:
              </h3>
              <ul className="list-disc list-outside space-y-2 text-secondary text-sm leading-relaxed ml-6 mt-3">
                <li>
                  In order for a <strong>Governance Proposal</strong> to be
                  enacted, it must:
                  <ul className="list-[circle] list-outside space-y-2 ml-6 mt-2 text-sm leading-relaxed">
                    <li>
                      first be submitted as a <strong>Temp-Check</strong>, which
                      is a five-day period during which <strong>Members</strong>{" "}
                      can utilize their SYND token to indicate support for a
                      proposal. In order for a proposal to transition from a{" "}
                      <strong>Temp-Check</strong> to a vote of the membership,
                      the <strong>Temp-Check</strong> must attain the support of
                      5% of the SYND tokens in circulation, except as limited by
                      Article 13 of the Association Agreement.
                    </li>
                    <li>
                      upon a successful <strong>Temp-Check</strong>, the{" "}
                      <strong>Governance Proposal</strong> period is open for
                      seven days, during which time <strong>Members</strong> can
                      utilize their SYND token to affirm, deny, or participate
                      without voting on the proposal. A proposal:
                      <ul className="list-[square] list-outside space-y-1 ml-6 mt-2 text-sm leading-relaxed">
                        <li>
                          <strong>passes</strong> if the majority of votes
                          affirm the proposal and 10% of the SYND tokens in
                          circulation participate in the vote; and
                        </li>
                        <li>
                          <strong>fails</strong> if the majority of votes deny
                          the proposal or 10% of the SYND tokens in circulation
                          did not participate in the vote.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>
                  A passed <strong>Governance Proposal</strong> can be reverted
                  for further consideration and modification pursuant to Article
                  14 of the Association Agreement if it is determined by the{" "}
                  <strong>Rules Committee</strong> within 3-days of passage to
                  be violative of legal requirements, technically unfeasible, or
                  malicious. If the 3-day period expires without reversion or
                  the <strong>Rules Committee</strong> affirms the{" "}
                  <strong>Governance Proposal</strong>, it is enacted.
                </li>
                <li>
                  Upon enactment of a <strong>Governance Proposal</strong>, any
                  recipients of funds must complete a tax reporting intake
                  through tooling provided by the{" "}
                  <strong>Rules Committee Administrator</strong> within 15 days,
                  or the payment will expire, and the recipient shall not be
                  eligible to receive the funds absent future{" "}
                  <strong>Governance Proposal</strong>.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Voting Power Section */}
        <div id="voting-power">
          <h3 className="text-2xl font-black text-primary mt-12">
            Voting Power
          </h3>
          <div className="mt-4 rounded-xl border border-line shadow-sm bg-infoSectionBackground">
            <div className="p-6">
              <h3 className="text-lg font-bold text-primary">
                How voting power works:
              </h3>
              <div className="flex flex-col space-y-3 text-secondary text-sm leading-relaxed mt-3">
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
                  Either way, you keep full ownership of your tokens. Delegation{" "}
                  <strong>does not</strong> let anyone move your tokens or claim
                  them; it only points your voting power. You can change or
                  revoke delegation at any time by making a new delegation.
                </p>
              </div>

              <h3 className="text-lg font-bold text-primary mt-6">
                Why it&apos;s designed this way:
              </h3>
              <p className="text-secondary text-sm leading-relaxed mt-3">
                This model keeps everyday transfers cheaper and lets governance
                use reliable onchain snapshots of voting power at specific
                blocks.
              </p>
            </div>
          </div>

          {/* Self-Delegation Section */}
          <div
            id="self-delegation"
            className="mt-6 rounded-xl border border-line shadow-sm bg-infoSectionBackground"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-primary">
                Self-Delegation
              </h3>
              <div className="flex flex-col space-y-3 text-secondary text-sm leading-relaxed mt-3">
                <p>
                  Self-delegating activates your voting power so you can vote
                  directly in onchain proposals.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm">
                  <li>
                    Onchain action: Call{" "}
                    <code className="font-mono bg-wash px-1 rounded">
                      delegate(0xYOUR-WALLET-HERE)
                    </code>
                    .
                  </li>
                  <li>
                    After this one-time step (per address, per chain), your
                    votes will track your token balance automatically. No need
                    to repeat unless you later delegate to someone else.
                  </li>
                </ul>
                <p className="font-medium">Vote directly from your wallet</p>
                <p>
                  To self-delegate, visit the{" "}
                  <a
                    href="/delegates"
                    className="text-primary underline hover:no-underline"
                  >
                    Delegates page
                  </a>{" "}
                  and connect your wallet.
                </p>
              </div>
            </div>
          </div>

          {/* Delegate to Others Section */}
          <div
            id="delegate-to-others"
            className="mt-6 rounded-xl border border-line shadow-sm bg-infoSectionBackground"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold text-primary">
                Delegate to Other Members
              </h3>
              <div className="flex flex-col space-y-3 text-secondary text-sm leading-relaxed mt-3">
                <p>
                  You can point your voting power to a trusted delegate. This
                  helps active representatives vote on your behalf while{" "}
                  <strong>you retain token ownership</strong> and can
                  re-delegate at any time.
                </p>
                <p>
                  <strong>You are still a member of the WY DUNA.</strong>
                </p>
                <p>
                  Under Wyoming&apos;s Decentralized Unincorporated Nonprofit
                  Association Act, a <strong>member</strong> is someone who may
                  participate in selecting administrators or shaping policies. A{" "}
                  <strong>membership interest</strong> is the voting right
                  defined by those principles, and the Act explicitly
                  contemplates that voting can be administered by smart
                  contracts. Delegating your votes{" "}
                  <strong>does not transfer your tokens</strong> or your
                  membership; it only authorizes another address to cast votes
                  using your voting power.
                </p>
                <p>
                  Browse and choose a delegate on the{" "}
                  <a
                    href="/delegates"
                    className="text-primary underline hover:no-underline"
                  >
                    Delegates page
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>

        {!ui.toggle("hide-governor-settings")?.enabled && <GovernorSettings />}
        {hasDunaAdministration &&
        ui.toggle("towns-duna-administration")?.enabled ? (
          <TownsDunaAdministration />
        ) : (
          hasDunaAdministration && <DunaAdministration />
        )}
        {treasuryData.result.length > 0 && (
          <ChartTreasury
            initialData={treasuryData.result}
            getData={async (frequency: string) => {
              "use server";
              return apiFetchTreasuryBalanceTS(frequency);
            }}
          />
        )}
        {hasGovernanceCharts && (
          <GovernanceCharts
            getDelegates={async () => {
              "use server";
              return apiFetchDelegateWeights();
            }}
            getVotes={async () => {
              "use server";
              return apiFetchProposalVoteCounts();
            }}
            getMetrics={async (metric: string, frequency: string) => {
              "use server";
              return apiFetchMetricTS(metric, frequency);
            }}
          />
        )}
        {hasDunaAdministration ? (
          ui.toggle("towns-duna-administration")?.enabled ? null : ui.toggle(
              "syndicate-duna-disclosures"
            )?.enabled ? (
            <SyndicateDunaDisclosures />
          ) : (
            <DunaDisclosures />
          )
        ) : null}
      </div>
    );
  } else {
    return (
      <div>
        <Hero page="info" />
        <div>
          <div className="flex gap-6">
            <div className="bg-gradient-to-b from-stone-300 to-white w-[1px] relative top-2"></div>
            <div className="flex flex-col gap-8 max-w-2xl">
              <div>
                <div className="text-sm text-indigo-800 font-medium">
                  Live – ETHFI token launch
                </div>
                <div>
                  <div className="w-[13px] h-[13px] rounded-full bg-indigo-800 relative -left-[31px] border-4 -top-4"></div>
                  On March 18th, we’re launching the $ETHFI token and taking the
                  first step towards full decentralization.
                </div>
              </div>
              <div>
                <div className="text-sm text-secondary font-medium">
                  Phase 1 – Governance initiation
                </div>
                <div className="w-[5px] h-[5px] rounded-full bg-stone-300 relative -left-[27px] -top-4"></div>
                <div>
                  Over the next weeks, we will be gradually bringing voters into
                  Ether.fi’s governance by launching offchain voting on
                  Snapshot, delegate elections, our security council, and
                  discourse groups.
                </div>
              </div>
              <div>
                <div className="text-sm text-secondary font-medium">
                  Phase 2 – Transition to onchain governance
                </div>
                <div>
                  <div className="w-[5px] h-[5px] rounded-full bg-stone-300 relative -left-[27px] -top-4"></div>
                  As the community grows over the next months, we will be fully
                  deploying the Agora onchain governor, and granting the
                  community access control to Ether.fi’s protocol and treasury.
                  This is allow Ether.fi’s team and the community to fully
                  collaborate in steering the protocol.
                </div>
              </div>
              <div>
                <div className="text-sm text-secondary font-medium">
                  Phase 3 – Full Ossification
                </div>
                <div className="w-[5px] h-[5px] rounded-full bg-stone-300 relative -left-[27px] -top-4"></div>
                <div>
                  In the long run, we’ll work on fully automating and ossifying
                  governance function so that Ether.fi can stand the test of
                  time and last as an immutable protocol underpinning Ethereum’s
                  staking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
