import { HStack } from "@/components/Layout/Stack";

import Tenant from "@/lib/tenant/tenant";
import StackingHeroSection from "@/components/Staking/StackingHeroSection";
import StackingInfoBoxes from "@/components/Staking/StackingInfoBoxes";
import FAQs from "@/components/Staking/FAQs";
import CollectFeeActionCard from "@/components/Staking/CollectFeeActionCard";
import ConfirmStakingCard from "@/components/Staking/ConfirmStakingCard";

export default function Page() {
  const { ui } = Tenant.current();

  if (!ui.toggle("staking")) {
    return <div>Route not supported for namespace</div>;
  }

  return (
    <HStack className="grid grid-cols-1 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-5 sm:gap-10 w-full max-w-6xl pb-16 mt-12 font-inter">
      <div className="sm:col-span-4">
        <StackingHeroSection />
        <StackingInfoBoxes />
        <FAQs />
      </div>
      <div className="sm:col-start-5">
        <ConfirmStakingCard />
        <CollectFeeActionCard />
      </div>
    </HStack>
  );
}
