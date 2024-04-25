import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { getBlockScanUrl } from "@/lib/utils";
import { VStack } from "@/components/Layout/Stack";
import { getProposalTypeText } from "@/lib/utils";

export default function ProposalTitle({
  title,
  proposalType,
  createdTransactionHash,
}) {
  const proposalText = getProposalTypeText(proposalType);
  return (
    <VStack className="flex-col-reverse items-start">
      <h2 className="font-black text-2xl">{title}</h2>
      <div className="text-xs font-semibold text-gray-700 flex items-center">
        {/* Warning: this assumes OP FND is the only proposer. Will need to maintain an array of OP Foundation proposals eventually */}
        {proposalText} by The Optimism Foundation
        {/* <HumanAddress address={proposerAddress} /> */}
        <a
          href={getBlockScanUrl(createdTransactionHash)}
          target="_blank"
          rel="noreferrer noopener"
        >
          <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
        </a>
      </div>
    </VStack>
  );
}
