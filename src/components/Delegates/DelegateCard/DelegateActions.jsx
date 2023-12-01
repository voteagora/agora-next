import { HStack } from "@/components/Layout/Stack";
import { DelegateButton } from "./DelegateButton";
import { DelegateSocialLinks } from "./DelegateSocialLinks";

// TODO: add twitter and discord links (from delegate statement)
const statement = {
  discord: "agora",
  twitter: "agora",
};
export function DelegateActions({ className, address, votingPower }) {
  return (
    <HStack
      justifyContent="space-between"
      alignItems="stretch"
      className={className ? className + "justify-between" : "justify-between"}
    >
      <DelegateSocialLinks
        discord={statement?.twitter}
        twitter={statement?.discord}
      />
      <DelegateButton
        full={!statement || (!statement?.twitter && !statement?.discord)}
        address={address}
        votingPower={votingPower}
      />
    </HStack>
  );
}
