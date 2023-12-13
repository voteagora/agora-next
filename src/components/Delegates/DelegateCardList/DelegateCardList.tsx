"use client";

import * as React from "react";
import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroller";
import Image from "next/image";
import { VStack } from "../../Layout/Stack";
import { DelegateActions } from "../DelegateCard/DelegateActions";
import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import styles from "./DelegateCardList.module.scss";
import { useRouter } from "next/navigation";
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { Delegate } from "@/app/api/delegates/delegate";
import { useAccount, useContractRead } from "wagmi";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { OptimismContracts } from "@/lib/contracts/contracts";
import { parseUnits } from "viem";

export type DelegateChunk = Pick<
  Delegate,
  "address" | "votingPower" | "statement"
>;

interface DelegatePaginated {
  meta: any;
  delegates: DelegateChunk[];
}

interface Props {
  initialDelegates: DelegatePaginated;
  fetchDelegates: (page: number) => Promise<DelegatePaginated>;
  fetchBalanceForDirectDelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  fetchVotingPowerForSubdelegation: (
    addressOrENSName: string
  ) => Promise<string>;
  checkIfDelegatingToProxy: (addressOrENSName: string) => Promise<boolean>;
  fetchCurrentDelegatees: (addressOrENSName: string) => Promise<any>;
  getProxyAddress: (addressOrENSName: string) => Promise<string>;
}

export default function DelegateCardList({
  initialDelegates,
  fetchDelegates,
  fetchBalanceForDirectDelegation,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  getProxyAddress,
}: Props) {
  const router = useRouter();
  const fetching = React.useRef(false);
  const [pages, setPages] = React.useState([initialDelegates] || []);
  const [meta, setMeta] = React.useState(initialDelegates.meta);
  const [isAdvancedUser, setIsAdvancedUser] = React.useState(false);
  const allowList = [] as `0x${string}`[];
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();

  useContractRead({
    address: OptimismContracts.token.address as `0x${string}`,
    abi: OptimismContracts.token.abi,
    functionName: "balanceOf",
    enabled: isConnected && !!address,
    args: [address!],
    onSuccess: (balance) => {
      // TODO: change allowed balance to 10K OP
      const allowedBalance = parseUnits("1", 18);
      setIsAdvancedUser(
        balance >= allowedBalance || allowList.includes(address!)
      );
    },
  });

  useEffect(() => {
    setPages([initialDelegates]);
    setMeta(initialDelegates.meta);
  }, [initialDelegates]);

  const handleClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    href: string
  ) => {
    e.preventDefault();
    router.push(href);
  };

  const loadMore = async (page: any) => {
    if (!fetching.current && meta.hasNextPage) {
      fetching.current = true;
      const data = await fetchDelegates(page);
      const existingIds = new Set(
        pages.flatMap((page) => page.delegates.map((d) => d.address))
      );
      const uniqueDelegates = data.delegates.filter(
        (d) => !existingIds.has(d.address)
      );
      setPages((prev) => [...prev, { ...data, delegates: uniqueDelegates }]);
      setMeta(data.meta);
      fetching.current = false;
    }
  };

  const delegates = pages.reduce(
    (all: DelegateChunk[], page) => all.concat(page.delegates),
    []
  );

  return (
    <DialogProvider>
      <InfiniteScroll
        className={styles.infinite_scroll}
        hasMore={meta.hasNextPage}
        pageStart={0}
        loadMore={loadMore}
        loader={
          <div key="loader">
            Loading...
            <Image
              src="/images/blink.gif"
              alt="Blinking Agora Logo"
              width={50}
              height={20}
            />
          </div>
        }
        element="div"
      >
        {delegates.map((delegate, i) => {
          let truncatedStatement = "";

          if (delegate.statement && delegate.statement.delegateStatement) {
            truncatedStatement = delegate.statement.delegateStatement.slice(
              0,
              120
            );
          }

          return (
            <div key={delegate.address} className={styles.link}>
              <VStack className={styles.link_container}>
                <VStack gap={4} className="h-full">
                  <div
                    onClick={(e) =>
                      handleClick(e, `/delegates/${delegate.address}`)
                    }
                  >
                    <VStack gap={4} justifyContent="justify-center">
                      <DelegateProfileImage
                        address={delegate.address}
                        votingPower={delegate.votingPower}
                      />
                      <p className={styles.summary}>{truncatedStatement}</p>
                    </VStack>
                  </div>
                  <div className="flex-grow" />
                  <DelegateActions
                    delegate={delegate}
                    isAdvancedUser={isAdvancedUser}
                    fetchBalanceForDirectDelegation={
                      fetchBalanceForDirectDelegation
                    }
                    fetchVotingPowerForSubdelegation={
                      fetchVotingPowerForSubdelegation
                    }
                    checkIfDelegatingToProxy={checkIfDelegatingToProxy}
                    fetchCurrentDelegatees={fetchCurrentDelegatees}
                    getProxyAddress={getProxyAddress}
                  />
                </VStack>
              </VStack>
            </div>
          );
        })}
      </InfiniteScroll>
    </DialogProvider>
  );
}
