import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { HStack, VStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";

interface IProps {
  selectedDelegateAddress: string | null;
  setShowReceipt: React.Dispatch<React.SetStateAction<boolean>>;
  buttonText?: string;
}

const SelectedDelegatesFeeCard: React.FC<IProps> = ({
  selectedDelegateAddress,
  setShowReceipt,
  buttonText,
}) => {
  const handleShowReceipt = () => {
    setShowReceipt(true);
  };

  return (
    <div className="border rounded-lg">
      <VStack className="p-4 rounded-lg border-b border-b-gray-300  shadow-newDefault ">
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
          Uniswap voters manage the fee switch. Choose your delegate carefully
          to represent you in Uniswap governance
        </p>
        <Link href="/staking/delegates">
          <Button
            className="w-full mb-3"
            disabled={selectedDelegateAddress === null}
            onClick={handleShowReceipt}
          >
            {buttonText
              ? buttonText
              : selectedDelegateAddress === null
              ? "Select delegate to continue"
              : "Continue"}
          </Button>
        </Link>
      </VStack>
      <HStack
        gap={4}
        className="p-4 justify-between items-center rounded-lg bg-gray-fa  border-b border-b-gray-300 shadow-newDefault"
      >
        <div className="flex flex-row gap-4">
          <div className="min-w-[48px] h-12 p-3 rounded-lg  border border-gray-300 shadow-newDefault ">
            <Image height={24} width={24} src={icons.currency} alt="" />
          </div>
          <VStack>
            <p className="text-xs font-semibold text-gray-4f">
              Also collect all my rewards
            </p>
            <h6 className="text-base font-medium text-black">2.1 WETH </h6>
          </VStack>
        </div>

        <Checkbox id="terms1" />
      </HStack>
    </div>
  );
};

export default SelectedDelegatesFeeCard;
