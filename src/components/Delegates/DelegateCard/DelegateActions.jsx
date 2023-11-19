import { HStack } from "@/components/Layout/Stack";
import { DelegateButton } from "./DelegateButton";
import { DelegateSocialLinks } from "./DelegateSocialLinks";

// TODO: add twitter and discord links (from delegate statement)
export function DelegateActions({ className, address, votingPower }) {
  return (
    <HStack
      justifyContent="space-between"
      alignItems="stretch"
      className={className}
    >
      {false && <DelegateSocialLinks discord={null} twitter={null} />}
      <DelegateButton full={true} address={address} votingPower={votingPower} />
    </HStack>
  );
}
