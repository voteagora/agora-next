import React from "react";
import { HStack, VStack } from "@/components/Layout/Stack";

const VotingTimelineTitle = () => {
  return (
    <HStack className="p-4 justify-between">
      <h2 className="text-2xl font-semibold text-black">Voting timeline</h2>
      <div className=" flex flex-row gap-5">
        <HStack className="flex flex-row gap-2 justify-start items-center">
          <div className="w-5 h-0.5  bg-green-400 "></div>
          <p className="text-sm font-semibold text-gray-4f">For</p>
        </HStack>

        <HStack className="flex flex-row gap-2 justify-start items-center">
          <div className="w-5 h-0.5  bg-red-500 "></div>
          <p className="text-sm font-semibold text-gray-4f">Against</p>
        </HStack>

        <HStack className="flex flex-row gap-2 justify-start items-center">
          <div className="w-5 h-0.5  bg-green-500 "></div>
          <p className="text-sm font-semibold text-gray-4f">Abstain</p>
        </HStack>
      </div>
    </HStack>
  );
};

export default VotingTimelineTitle;
