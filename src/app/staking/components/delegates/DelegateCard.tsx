import { cn } from "@/lib/utils";
import styles from "@/components/Delegates/DelegateCardList/DelegateCardList.module.scss";
import { HStack, VStack } from "@/components/Layout/Stack";
import { DelegateProfileImage } from "@/app/staking/components/delegates/DelegateProfileImage";
import { DelegateSocialLinks } from "@/components/Delegates/DelegateCard/DelegateSocialLinks";
import { Button } from "@/components/ui/button";

interface DelegateCardProps {
  address: string;
  action: string;
  discord?: string;
  twitter?: string;
  onSelect: (address: string) => void;
  statement: string;
  votingPower: string;
}

export const DelegateCard = ({
                        address,
                        action,
                        discord,
                        onSelect,
                        statement,
                        twitter,
                        votingPower,
                      }: DelegateCardProps) => {
  return <div className={cn(styles.link)}>
    <VStack gap={4} className={styles.link_container}>
      <VStack gap={4} justifyContent="justify-center">
        <DelegateProfileImage
          address={address}
          votingPower={votingPower}
        />
        <p className={styles.summary}>{statement}</p>
      </VStack>
      <div className="min-h-[24px]">
        <HStack
          alignItems="items-stretch"
          className="justify-between"
        >
          <DelegateSocialLinks
            discord={discord}
            twitter={twitter}
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
  </div>;
};
