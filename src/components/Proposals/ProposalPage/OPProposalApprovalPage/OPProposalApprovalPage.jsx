import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalResults from "../ProposalResults";
import ProposalDescription from "../ProposalDescription";
import { ProposalVotes } from "../ProposalVotes";

export default function OPProposalApprovalPage({ proposal }) {
  return (
    <HStack justifyContent="justify-between">
      <div>
        APPROVAL
        <ProposalDescription proposal={proposal} />
      </div>
      <VStack gap={6}>APPROVAL VOTES</VStack>
    </HStack>
  );
}
