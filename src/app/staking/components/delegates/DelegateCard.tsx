import { cn } from "@/lib/utils";
import styles from "@/components/Delegates/DelegateCardList/DelegateCardList.module.scss";
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
    <div className={cn(styles.link)}>
      <VStack gap={4} className={styles.link_container}>
        <VStack gap={4} justifyContent="justify-center">
          <DelegateProfileImage address={address} votingPower={votingPower} />
          <p className={styles.summary}>{statement}</p>
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
