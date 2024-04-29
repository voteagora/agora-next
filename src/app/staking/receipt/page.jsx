import { HStack } from "@/components/Layout/Stack";
import RewardRedemptionCard from "@/components/Staking/RewardRedemptionCard";
import TransactionReceipt from "@/components/Staking/TransactionReceipt/TransactionReceipt";

export default async function Page() {
  return (
    <HStack className="grid grid-cols-1  sm:grid-cols-4 gap-5 sm:gap-10 mt-12">
      <div className="sm:col-span-4">
        <TransactionReceipt
          receiptTitle="Confirm your staked UNI withdrawal transaction"
          address="tokenholder.eth"
          ownedAmount="500,000 UNI"
          receiptEntries={[
            {
              title: "Already staked",
              value: "100,000 UNI",
              showDivider: true,
            },
            {
              title: "Collecting rewards",
              value: "2.1 ETH",
            },
          ]}
        />
      </div>
      <div className="sm:col-start-5">
        <RewardRedemptionCard />
      </div>
    </HStack>
  );
}
