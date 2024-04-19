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
  isButtonDisabled?: boolean;
}

const RewardRedemptionCard: React.FC<IProps> = ({
  setShowReceipt,
  buttonText,
  isButtonDisabled,
}) => {
  const handleShowReceipt = () => {
    setShowReceipt(true);
  };

  return (
    <div className="border rounded-lg font-inter">
      <VStack className="p-4 rounded-lg border-b border-b-gray-300  shadow-newDefault ">
        <VStack className="w-full h-[123px] justify-center items-center rounded-lg border border-gray-300">
          <p className="text-xs font-semibold text-gray-4f">
            Collecting your reward
          </p>
          <h6 className="text-[44px] text-center font-semibold text-black">
            2.1 ETH
          </h6>
        </VStack>

        <p className="text-base font-medium text-gray-4f my-4 max-w-[322px]">
          Please verify your transaction details before confirming.
        </p>

        <Button
          disabled={isButtonDisabled}
          className="w-full mb-3"
          onClick={handleShowReceipt}
        >
          {buttonText ? buttonText : "Collect rewards"}
        </Button>
      </VStack>
      <HStack
        gap={4}
        className="p-4 justify-between items-center rounded-lg bg-gray-fa  border-b border-b-gray-300 shadow-newDefault"
      >
        <div className="flex flex-row gap-4">
          <div className="min-w-[48px] h-12 p-3 rounded-lg  border border-gray-300 shadow-newDefault ">
            <Image height={24} width={24} src={icons.logout} alt="" />
          </div>
          <VStack>
            <p className="text-xs font-semibold text-gray-4f">
              Also redeem my entire stake
            </p>
            <h6 className="text-base font-medium text-black">500,000ETH</h6>
          </VStack>
        </div>

        <Checkbox id="terms1" />
      </HStack>
    </div>
  );
};

export default RewardRedemptionCard;
