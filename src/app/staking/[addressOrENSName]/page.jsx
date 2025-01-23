import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { apiFetchStakedDeposits } from "@/app/api/staking/getDeposits";
import { fetchDelegate } from "@/app/api/common/delegates/getDelegates";
import { HStack } from "@/components/Layout/Stack";
import { DepositList } from "@/app/staking/[addressOrENSName]/deposits/DepositList";
import { StakingStats } from "@/app/staking/components/StakingStats";
import StakingFaq from "@/app/staking/components/StakingFaq";
import { PanelClaimRewards } from "@/app/staking/components/PanelClaimRewards";
import { PanelNewDeposit } from "@/app/staking/components/PanelNewDeposit";
import { ensNameToAddress } from "@/app/lib/ENSUtils";
import { revalidatePath } from "next/cache";
import { StakingIntro } from "@/app/staking/components/StakingIntro";

async function fetchDeposits(address) {
  "use server";
  return apiFetchStakedDeposits({ address });
}

async function apiFetchDelegate(address) {
  "use server";
  return fetchDelegate(address);
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
  const { ui, contracts } = Tenant.current();
  if (!ui.toggle("staking")) {
    return <div>Route not supported for namespace</div>;
  }

  const address =
    (await ensNameToAddress(addressOrENSName)) || addressOrENSName;

  const { token } = Tenant.current();
  const deposits = await fetchDeposits(address.toLowerCase());

  const [totalSupply, totalStaked, rewardPerToken, rewardDuration] =
    await Promise.all([
      contracts.token.isERC20()
        ? contracts.token.contract.totalSupply()
        : Promise.resolve(0),
      contracts.staker.contract.totalStaked(),
      contracts.staker.contract.rewardPerTokenAccumulated(),
      contracts.staker.contract.REWARD_DURATION(),
    ]);

  const hasDeposits = deposits && deposits.length > 0;

  return (
    <HStack className="grid grid-cols-1 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        {hasDeposits ? (
          <div>
            <div className="font-black text-2xl mb-5">
              Your {token.symbol} Stake
            </div>

            <DepositList
              deposits={deposits}
              fetchDelegate={apiFetchDelegate}
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
          <div className="font-black text-2xl mb-5">
            {token.symbol} Staking Metrics
          </div>
          <StakingStats
            rewardDuration={rewardDuration}
            rewardPerToken={rewardPerToken}
            totalStaked={totalStaked}
            totalSupply={totalSupply}
          />
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
    </HStack>
  );
}
