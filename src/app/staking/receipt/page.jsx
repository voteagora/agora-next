import { HStack } from "@/components/Layout/Stack";
import RewardRedemptionCard from "@/components/Staking/RewardRedemptionCard";
import DepositReceipt from "@/app/staking/components/DepositReceipt";

export default async function Page() {
  return (
    <HStack className="grid grid-cols-1  sm:grid-cols-4 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        <DepositReceipt />
      </div>
      <div className="sm:col-start-5">
        <RewardRedemptionCard />
      </div>
    </HStack>
  );
}
