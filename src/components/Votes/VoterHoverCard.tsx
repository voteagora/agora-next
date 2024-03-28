"use client";

import { VStack, HStack } from "@/components/Layout/Stack";
import { DelegateProfileImage } from "../Delegates/DelegateCard/DelegateProfileImage";
import Link from "next/link";
import { DelegateSocialLinks } from "../Delegates/DelegateCard/DelegateSocialLinks";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { useAccount } from "wagmi";
import { AdvancedDelegateButton } from "../Delegates/DelegateCard/AdvancedDelegateButton";
import { DelegateButton } from "../Delegates/DelegateCard/DelegateButton";
import useFetchDelegate from "@/hooks/useFetchDelegate";

interface Props {
  address: string;
  isAdvancedUser: boolean;
  delegators: string[] | null;
}

export default function VoterHoverCard({
  address,
  isAdvancedUser,
  delegators,
}: Props) {
  const { data: delegate } = useFetchDelegate(address);
  const { isConnected } = useAgoraContext();
  const { address: connectedAddress } = useAccount();

  let truncatedStatement = "";
  if (delegate?.statement?.payload) {
    const delegateStatement = (
      delegate?.statement?.payload as { delegateStatement: string }
    ).delegateStatement;
    truncatedStatement = delegateStatement.slice(0, 120);
  }

  return (
    <>
      {!delegate?.statement ? (
        <VStack gap={4} className="h-full w-[300px] p-2">
          <VStack gap={4} justifyContent="justify-center">
            <HStack gap={4} justifyContent="justify-start">
              <div className="w-14 h-14 rounded-full bg-gray-300 animate-pulse" />
              <VStack gap={2} justifyContent="justify-center">
                <div className="w-24 h-4 rounded-md bg-gray-300 animate-pulse" />
                <div className="w-12 h-4 rounded-md bg-gray-300 animate-pulse" />
              </VStack>
            </HStack>
            <div className="w-full h-12 rounded-md bg-gray-300 animate-pulse" />
          </VStack>
        </VStack>
      ) : (
        <VStack gap={4} className="h-full w-[300px]">
          <Link href={`/delegates/${address}`}>
            <VStack gap={4} justifyContent="justify-center">
              <DelegateProfileImage
                address={address}
                votingPower={!!delegate ? delegate.votingPower : "0"}
              />
              <p
                className={`break-words text-gray-600 overflow-hidden line-clamp-2 text-ellipsis`}
              >
                {truncatedStatement}
              </p>
            </VStack>
          </Link>
          <div className="flex-grow" />
          <HStack alignItems="items-stretch" className={"justify-between"}>
            <DelegateSocialLinks
              discord={delegate?.statement.discord}
              twitter={delegate?.statement.twitter}
            />
            <div>
              {!!delegate &&
                isConnected &&
                connectedAddress &&
                (isAdvancedUser ? (
                  <AdvancedDelegateButton
                    delegate={delegate}
                    delegators={delegators}
                  />
                ) : (
                  <DelegateButton
                    full={
                      !delegate?.statement.twitter &&
                      !delegate?.statement.discord
                    }
                    delegate={delegate}
                  />
                ))}
            </div>
          </HStack>
        </VStack>
      )}
    </>
  );
}
