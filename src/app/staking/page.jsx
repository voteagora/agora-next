
import { StakeDialog } from "@/app/staking/components/StakeDialog";
import Hero from "@/components/Hero/Hero";
import React from "react";

export default async function Page() {

  return (
    <section>
      <Hero />
      <StakeDialog />
    </section>
  );
}
