import { StakeDialog } from "@/app/staking/components/StakeDialog";
import { UnstakeDialog } from "@/app/staking/components/UnstakeDialog";
import { TotalStaked } from "@/app/staking/components/TotalStaked";
import Hero from "@/components/Hero/Hero";
import React from "react";

export default async function Page() {

  return (
    <section>
      <Hero />

      <div>
        <TotalStaked />
      </div>

      <div className="flex gap-5 columns-2">

        <StakeDialog />
        <UnstakeDialog />
      </div>
    </section>
  );
}
