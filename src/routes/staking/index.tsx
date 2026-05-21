/*
 * TanStack Start port of src/app/staking/page.tsx.
 * URL: /staking
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { StakingStats } from "@/components/Staking/StakingStats";
import { RedirectOrConnect } from "@/components/Staking/RedirectOrConnect";
import StakingFaq from "@/components/Staking/StakingFaq";
import { PanelNewDeposit } from "@/components/Staking/PanelNewDeposit";
import { StakingIntro } from "@/components/Staking/StakingIntro";

export const Route = createFileRoute("/staking/")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("staking")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  head: () => {
    const { ui } = Tenant.current();
    const page = ui.page("/");
    const { title, description } = page?.meta ?? {
      title: "Staking",
      description: "",
    };
    return {
      meta: [{ title }, { name: "description", content: description }],
    };
  },
  component: function StakingPage() {
    const { token } = Tenant.current();
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
          <div className="mt-10">
            <div className="font-black text-2xl mb-5 text-primary">
              Start New Deposit
            </div>
            <PanelNewDeposit />
          </div>
          <div className="mt-10">
            <StakingFaq />
          </div>
        </div>
      </div>
    );
  },
});
