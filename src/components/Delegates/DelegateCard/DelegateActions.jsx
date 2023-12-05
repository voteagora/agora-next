import { HStack } from "@/components/Layout/Stack";
import { DelegateButton } from "./DelegateButton";
import { DelegateSocialLinks } from "./DelegateSocialLinks";

export function DelegateActions({
  address,
  className,
  discord,
  twitter,
  votingPower,
}) {
  return (
    <HStack
      alignItems="items-stretch"
      className={className ? className + "justify-between" : "justify-between"}
    >
      <DelegateSocialLinks discord={discord} twitter={twitter} />
      <DelegateButton
        full={!twitter && !discord}
        address={address}
        votingPower={votingPower}
      />
    </HStack>
  );
}
