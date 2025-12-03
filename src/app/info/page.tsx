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
import SyndicateEducationalContent from "@/app/info/components/SyndicateEducationalContent";
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
        {namespace === TENANT_NAMESPACES.SYNDICATE && (
          <SyndicateEducationalContent />
        )}
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
