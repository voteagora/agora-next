import React from "react";
import { VStack } from "@/components/Layout/Stack";

function VoteReason({ reason }) {
  return (
    <VStack className="overflow-x-hidden text-xs font-medium whitespace-pre-wrap text-secondary break-words scrollbar-hide sm:pt-0 sm:h-fit">
      Reason: {reason}
    </VStack>
  );
}

export default VoteReason;
