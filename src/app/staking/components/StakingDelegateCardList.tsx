"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { HStack, VStack } from "@/components/Layout/Stack";

import { DelegateProfileImage } from "@/components/Delegates/DelegateCard/DelegateProfileImage";
import styles from "@/components/Delegates/DelegateCardList/DelegateCardList.module.scss";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { capitalizeFirstLetter, cn, numberToToken } from "@/lib/utils";
import { DelegateSocialLinks } from "@/components/Delegates/DelegateCard/DelegateSocialLinks";
import { Button } from "@/components/ui/button";
import Tenant from "@/lib/tenant/tenant";

export type DelegateChunk = Pick<
  Delegate,
  "address" | "votingPower" | "statement" | "citizen"
>;

interface DelegatePaginated {
  seed: number;
  meta: any;
  delegates: DelegateChunk[];
}

interface Props {
  address: string;
  amount: number;
  initialDelegates: DelegatePaginated;
  fetchDelegates: (page: number, seed: number) => Promise<DelegatePaginated>;
  onSelect: (address: string) => void;
}

export default function StakingDelegateCardList({
                                                  address,
                                                  amount,
                                                  initialDelegates,
                                                  fetchDelegates,
                                                  onSelect,
                                                }: Props) {

  const fetching = useRef(false);
  const [meta, setMeta] = useState(initialDelegates.meta);
  const [delegates, setDelegates] = useState(initialDelegates.delegates);
  const { namespace } = Tenant.current();


  useEffect(() => {
    setDelegates(initialDelegates.delegates);
    setMeta(initialDelegates.meta);
  }, [initialDelegates]);

  const loadMore = async () => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchDelegates(
        meta.currentPage + 1,
        initialDelegates.seed,
      );
      setDelegates(delegates.concat(data.delegates));
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  return (
    <DialogProvider>
      {/* @ts-ignore */}
      <InfiniteScroll
        className={styles.infinite_scroll}
        hasMore={meta.hasNextPage}
        pageStart={1}
        loadMore={loadMore}
        loader={
          <div
            className="w-full h-full min-h-[140px] bg-slate-50 rounded-xl text-slate-300 flex items-center justify-center"
            key="loader"
          >
            Loading...
          </div>
        }
        element="div"
      >
        <DelegateCard
          key={address}
          address={address}
          onSelect={onSelect}
          statement={`Delegate your votes to yourself to engage directly in ${capitalizeFirstLetter(namespace)} governance.`}
          action={"I’ll vote myself"}
          votingPower={numberToToken(amount).toString()}
        />
        {delegates.map((delegate) => {
          let truncatedStatement = "";

          const twitter = delegate?.statement?.twitter;
          const discord = delegate?.statement?.discord;

          if (delegate?.statement?.payload) {
            const delegateStatement = (
              delegate?.statement?.payload as { delegateStatement: string }
            ).delegateStatement;

            truncatedStatement = delegateStatement.slice(0, 120);
          }

          return (
            <DelegateCard
              key={delegate.address}
              action={"Select as delegate"}
              address={delegate.address}
              discord={discord}
              onSelect={onSelect}
              statement={truncatedStatement}
              twitter={twitter}
              votingPower={delegate.votingPower}
            />
          );
        })}
      </InfiniteScroll>
    </DialogProvider>
  );
}

interface DelegateCardProps {
  address: string;
  action: string;
  discord?: string;
  twitter?: string;
  onSelect: (address: string) => void;
  statement: string;
  votingPower: string;
}

const DelegateCard = ({
                        address,
                        action,
                        discord,
                        onSelect,
                        statement,
                        twitter,
                        votingPower,
                      }: DelegateCardProps) => {
  return <div
    className={cn(styles.link)}>
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


