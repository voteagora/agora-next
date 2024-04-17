import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HStack, VStack } from "@/components/Layout/Stack";

interface IProps {
  selectedDelegateAddress: string | null;
  setShowReceipt: React.Dispatch<React.SetStateAction<boolean>>;
}

const SelectedDelegatesFeeCard: React.FC<IProps> = ({
  selectedDelegateAddress,
  setShowReceipt,
}) => {
  const handleShowReceipt = () => {
    setShowReceipt(true);
  };
  return (
    <VStack className="p-4 rounded-lg border border-gray-300 shadow-newDefault ">
      <VStack className="w-full h-[123px] justify-center items-center rounded-lg border border-gray-300">
        <p className="text-xs font-semibold text-gray-4f">
          Stake UNI to earn fees
        </p>
        <HStack className="w-full gap-x-3 justify-center items-center">
          <h6 className="text-[44px] font-semibold text-black">500,000</h6>
          <Image
            src="/images/horse_icon.png"
            alt="img"
            width={40}
            height={40}
            className="rounded"
          />
        </HStack>
      </VStack>

      <p className="text-base font-medium text-gray-4f my-4 max-w-[322px]">
        Uniswap voters manage the fee switch. Choose your delegate carefully to
        represent you in Uniswap governance
      </p>
      <Link href="/staking/delegates">
        <Button
          className="w-full"
          disabled={selectedDelegateAddress === null}
          onClick={handleShowReceipt}
        >
          {selectedDelegateAddress === null
            ? "Select delegate to continue"
            : "Continue"}
        </Button>
      </Link>
    </VStack>
  );
};

export default SelectedDelegatesFeeCard;
