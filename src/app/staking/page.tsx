// export const dynamic = 'force-dynamic'; // this line is uncommented for e2e tests

import React from "react";
import { StakingStats } from "@/app/staking/components/StakingStats";
import Tenant from "@/lib/tenant/tenant";
import { RedirectOrConnect } from "@/app/staking/components/RedirectOrConnect";
import StakingFaq from "@/app/staking/components/StakingFaq";
import { PanelNewDeposit } from "@/app/staking/components/PanelNewDeposit";
import { StakingIntro } from "@/app/staking/components/StakingIntro";
import { RouteNotSupported } from "@/components/shared/RouteNotSupported";

export async function generateMetadata({}) {
  const tenant = Tenant.current();
  const page = tenant.ui.page("/");

  const { title, description } = page?.meta || { title: "", description: "" };

  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
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
  const { token, ui } = Tenant.current();

  if (!ui.toggle("staking")?.enabled) {
    return <RouteNotSupported />;
  }

  return (
    <div className="grid grid-cols-1 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        <StakingIntro />
        <div className="mt-2">
          <RedirectOrConnect />
        </div>

        <div className="mt-10">
          <div className="font-black text-2xl mb-5 text-primary">
            {token.symbol} Staking Metrics
          </div>
          <StakingStats />
        </div>

        <StakingFaq />
      </div>

      <div className="sm:col-start-5">
        <PanelNewDeposit />
      </div>
    </div>
  );
}
