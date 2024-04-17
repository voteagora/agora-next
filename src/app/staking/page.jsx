import { StakeDialog } from "@/app/staking/components/StakeDialog";
import { UnstakeDialog } from "@/app/staking/components/UnstakeDialog";
import { PoolStats } from "@/app/staking/components/PoolStats";
import Hero from "@/components/Hero/Hero";
import React from "react";
import { apiFetchTotalStaked } from "@/app/api/common/staking/getTotalStaked";
import { apiFetchTotalSupply } from "@/app/api/common/token/getTotalSupply";


async function fetchTotalStaked() {
  "use server";
  return apiFetchTotalStaked();
}

async function fetchTotalSupply() {
  "use server";
  return apiFetchTotalSupply();
}


export default async function Page() {

  const totalStaked = await fetchTotalStaked();
  const totalSupply = await fetchTotalSupply();

  return (
    <section>
      <Hero />

      <div className="flex gap-5 columns-3">
        <StakeDialog />
        <UnstakeDialog />
        <PoolStats totalStaked={totalStaked} totalSupply={totalSupply}/>
      </div>
    </section>
  );
}
