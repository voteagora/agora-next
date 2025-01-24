import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { apiFetchStakedDeposits } from "@/app/api/staking/getDeposits";
import { DepositList } from "@/app/staking/[addressOrENSName]/deposits/DepositList";
import { StakingStats } from "@/app/staking/components/StakingStats";
import StakingFaq from "@/app/staking/components/StakingFaq";
import { PanelClaimRewards } from "@/app/staking/components/PanelClaimRewards";
import { PanelNewDeposit } from "@/app/staking/components/PanelNewDeposit";
import { ensNameToAddress } from "@/app/lib/ENSUtils";
import { revalidatePath } from "next/cache";
import { StakingIntro } from "@/app/staking/components/StakingIntro";
import { RouteNotSupported } from "@/components/shared/RouteNotSupported";

async function fetchDeposits(address) {
  "use server";
  return apiFetchStakedDeposits({ address });
}

export async function generateMetadata({}) {
  const tenant = Tenant.current();
  const page = tenant.ui.page("/");

  const { title, description } = page.meta;

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

export default async function Page({ params: { addressOrENSName } }) {
  const { ui, token } = Tenant.current();
  if (!ui.toggle("staking").enabled) {
    return <RouteNotSupported />;
  }

  const address = await ensNameToAddress(addressOrENSName);
  const deposits = await fetchDeposits(address.toLowerCase());
  const hasDeposits = deposits && deposits.length > 0;

  return (
    <div className="grid grid-cols-1 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        {hasDeposits ? (
          <div>
            <div className="text-primary font-black text-2xl mb-5">
              Your {token.symbol} Stake
            </div>

            <DepositList
              deposits={deposits}
              refreshPath={async (path) => {
                "use server";
                revalidatePath(path);
              }}
            />
          </div>
        ) : (
          <StakingIntro />
        )}

        <div className="mt-10">
          <div className="text-primary font-black text-2xl mb-5">
            {token.symbol} Staking Metrics
          </div>
          <StakingStats />
        </div>
        <StakingFaq />
      </div>
      <div className="sm:col-start-5">
        {hasDeposits ? (
          <div>
            <h2 className="font-black text-2xl text-primary mb-5">
              Your rewards
            </h2>
            <PanelClaimRewards />
          </div>
        ) : (
          <PanelNewDeposit />
        )}
      </div>
    </div>
  );
}
