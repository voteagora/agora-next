import { StakeButton } from "@/app/staking/components/StakeButton";
import { StakedBalance } from "@/app/staking/components/StakedBalance";
import { UnstakedBalance } from "@/app/staking/components/UnstakedBalance";
import Hero from "@/components/Hero/Hero";
import React from "react";

export default async function Page() {

  return (
    <section>
      <Hero />

      {/*<div>*/}
      {/*  <UnstakedBalance />*/}
      {/*</div>*/}

      {/*<div>*/}
      {/*  <StakedBalance />*/}
      {/*</div>*/}
      <div>
        <StakeButton />
      </div>

    </section>
  );
}
