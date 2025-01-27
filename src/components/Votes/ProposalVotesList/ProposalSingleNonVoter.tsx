import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDisplay from "@/components/shared/TokenAmountDisplay";
import ENSAvatar from "@/components/shared/ENSAvatar";
import { useAccount, useEnsName } from "wagmi";
import discordIcon from "@/icons/discord.svg";
import xIcon from "@/icons/x.svg";
import warpcastIcon from "@/icons/warpcast.svg";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useGetVotes } from "@/hooks/useGetVotes";
import { Proposal } from "@/app/api/common/proposals/proposal";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import ENSName from "@/components/shared/ENSName";

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
  const { namespace } = Tenant.current();

  const { address: connectedAddress } = useAccount();
  const { data } = useEnsName({
    chainId: 1,
    address: voter.delegate as `0x${string}`,
  });

  const { data: pastVotes } = useGetVotes({
    address: voter.delegate as `0x${string}`,
    blockNumber: BigInt(proposal.snapshotBlockNumber),
    enabled: namespace !== TENANT_NAMESPACES.UNISWAP,
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
          <div className="text-primary">
            <ENSName address={voter.delegate} />
          </div>
          {voter.delegate === connectedAddress?.toLowerCase() && (
            <p className="text-primary">(you)</p>
          )}
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
        <HStack className="text-primary" alignItems="items-center">
          <TokenAmountDisplay
            amount={pastVotes || voter.direct_vp}
            useChivoMono
            hideCurrency
            specialFormatting
          />
        </HStack>
      </HStack>
    </VStack>
  );
}
