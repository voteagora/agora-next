import { HStack } from "@/components/Layout/Stack";
import RewardRedemptionCard from "@/components/Staking/RewardRedemptionCard";
import TransactionReceipt from "@/components/Staking/TransactionReceipt/TransactionReceipt";

export default async function Page() {
  return (
    <HStack className="grid grid-cols-1  sm:grid-cols-4 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        <TransactionReceipt />
      </div>
      <div className="sm:col-start-5">
        <RewardRedemptionCard />
      </div>
    </HStack>
  );
}
