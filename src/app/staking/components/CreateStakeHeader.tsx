"use client";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import { HStack } from "@/components/Layout/Stack";
import Link from "next/link";

interface CreateStakeHeaderProps {
  title: string;
  step: number;
}

const CreateStakeHeader: React.FC<CreateStakeHeaderProps> = ({
  title,
  step,
}) => {
  return (
    <HStack className="flex flex-row justify-start items-center gap-4">
      <Link
        href="/staking"
        className="w-10 h-10 flex justify-center items-center rounded-full border border-gray-300 shadow-newDefault cursor:pointer"
      >
        <Image height={24} width={24} src={icons.arrow_right} alt="arrow" />
      </Link>
      <h1 className="text-2xl font-black text-black">{title}</h1>
      <p className="text-base font-medium text-gray-4f leading-6 ml-5">
        Step {step}/3
      </p>
    </HStack>
  );
};

export default CreateStakeHeader;
