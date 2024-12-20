import { VStack, HStack } from "@/components/Layout/Stack";
import HumanAddress from "@/components/shared/HumanAddress";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import ENSAvatar from "@/components/shared/ENSAvatar";
import { useEnsName, useAccount } from "wagmi";
import discordIcon from "@/icons/discord.svg";
import xIcon from "@/icons/x.svg";
import warpcastIcon from "@/icons/warpcast.svg";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useGetVotes } from "@/hooks/useGetVotes";
import { Proposal } from "@/app/api/common/proposals/proposal";

export function ProposalSingleNonVoter({
  voter,
  proposal,
}: {
  proposal: Proposal;
  voter: {
    delegate: string;
    direct_vp: string;
    twitter: string | null;
    discord: string | null;
    warpcast: string | null;
  };
}) {
  const { address: connectedAddress } = useAccount();
  const { data } = useEnsName({
    chainId: 1,
    address: voter.delegate as `0x${string}`,
  });

  const { data: pastVotes } = useGetVotes({
    address: voter.delegate as `0x${string}`,
    blockNumber: BigInt(proposal.snapshotBlockNumber),
  });

  return (
    <VStack
      key={voter.delegate}
      gap={2}
      className="text-xs text-tertiary px-0 py-1"
    >
      <HStack
        justifyContent="justify-between"
        className="font-semibold text-secondary"
      >
        <HStack gap={1} alignItems="items-center">
          <ENSAvatar ensName={data} className="w-5 h-5" />
          <HumanAddress address={voter.delegate} />
          {voter.delegate === connectedAddress?.toLowerCase() && <p>(you)</p>}
          {voter.twitter && (
            <button
              className="hover:opacity-80"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window &&
                  window.open(`https://twitter.com/${voter.twitter}`, "_blank");
              }}
            >
              <Image height={8} width={8} src={xIcon.src} alt="x icon" />
            </button>
          )}
          {voter.discord && (
            <button
              className="hover:opacity-80"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast("copied discord handle to clipboard");
                navigator.clipboard.writeText(voter.discord ?? "");
              }}
            >
              <Image
                height={10}
                width={10}
                src={discordIcon.src}
                alt="discord icon"
              />
            </button>
          )}
          {voter.warpcast && (
            <button
              className="hover:opacity-80"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window &&
                  window.open(
                    `https://warpcast.com/${voter.warpcast?.replace(/@/g, "")}`,
                    "_blank"
                  );
              }}
            >
              <Image
                height={10}
                width={10}
                src={warpcastIcon.src}
                alt="warpcast icon"
              />
            </button>
          )}
        </HStack>
        <HStack alignItems="items-center">
          <TokenAmountDisplay amount={pastVotes || "0"} />
        </HStack>
      </HStack>
    </VStack>
  );
}
