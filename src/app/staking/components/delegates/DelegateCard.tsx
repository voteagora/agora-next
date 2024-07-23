import { HStack, VStack } from "@/components/Layout/Stack";
import { DelegateProfileImage } from "@/app/staking/components/delegates/DelegateProfileImage";
import { DelegateSocialLinks } from "@/components/Delegates/DelegateCard/DelegateSocialLinks";
import { Button } from "@/components/ui/button";

interface DelegateCardProps {
  action: string;
  address: string;
  discord?: string;
  onSelect: (address: string) => void;
  statement: string;
  twitter?: string;
  votingPower?: string;
  warpcast?: string;
}

export const DelegateCard = ({
  action,
  address,
  discord,
  onSelect,
  statement,
  twitter,
  votingPower,
  warpcast,
}: DelegateCardProps) => {
  return (
    <div className="flex flex-col">
      <VStack
        gap={4}
        className="bg-neutral border border-line shadow-newDefault rounded-xl"
      >
        <VStack gap={4} justifyContent="justify-center">
          <DelegateProfileImage address={address} votingPower={votingPower} />
          <p className="break-words text-secondary overflow-hidden overflow-ellipsis line-clamp-2 text-base min-h-[48px]">
            {statement}
          </p>
        </VStack>
        <div className="min-h-[24px]">
          <HStack alignItems="items-stretch" className="justify-between">
            <DelegateSocialLinks
              discord={discord}
              twitter={twitter}
              warpcast={warpcast}
            />
            <Button
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSelect(address);
              }}
            >
              {action}
            </Button>
          </HStack>
        </div>
      </VStack>
    </div>
  );
};
