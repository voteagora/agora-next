import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalResults from "../ProposalResults";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { ProposalVotes } from "../ProposalVotes";

export default function OPProposalApprovalPage({ proposal }) {
  return (
    <HStack justifyContent="justify-between">
      <div>
        STANDARD
        <ProposalDescription proposal={proposal} />
      </div>
      <VStack gap={6}>STANDARD VOTES</VStack>
    </HStack>
  );
}
