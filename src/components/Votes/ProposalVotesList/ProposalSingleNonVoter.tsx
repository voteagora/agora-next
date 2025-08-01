import { HStack, VStack } from "@/components/Layout/Stack";
import TokenAmountDecorated from "@/components/shared/TokenAmountDecorated";
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
import { fontMapper } from "@/styles/fonts";
import Link from "next/link";

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
    citizen_type: string | null;
    voterMetadata: {
      name: string;
      image: string;
      type: string;
    } | null;
  };
}) {
  const { namespace, ui } = Tenant.current();

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
      key={voter.delegate + (voter.citizen_type || "")}
      gap={2}
      className="text-xs text-tertiary px-0 py-1"
    >
      <HStack
        justifyContent="justify-between"
        className="font-semibold text-secondary"
      >
        <HStack gap={1} alignItems="items-center">
          {voter.voterMetadata?.image ? (
            <div
              className={`overflow-hidden rounded-full flex justify-center items-center w-8 h-8`}
            >
              <img
                src={voter.voterMetadata.image}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <ENSAvatar ensName={data} className="w-8 h-8" />
          )}
          <div className="flex flex-col">
            <div className="text-primary font-bold hover:underline">
              <Link href={`/delegates/${voter.delegate}`}>
                {voter.voterMetadata?.name ? (
                  voter.voterMetadata.name
                ) : (
                  <ENSName address={voter.delegate} />
                )}
              </Link>
            </div>
            {voter.citizen_type && (
              <div className="text-[9px] font-bold text-tertiary">
                {voter.citizen_type?.charAt(0).toUpperCase() +
                  voter.citizen_type?.slice(1).toLowerCase()}
              </div>
            )}
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
          <TokenAmountDecorated
            amount={
              voter.citizen_type
                ? voter.direct_vp
                : pastVotes || voter.direct_vp
            }
            hideCurrency
            specialFormatting
            className={
              fontMapper[ui?.customization?.tokenAmountFont || ""]?.variable
            }
          />
        </HStack>
      </HStack>
    </VStack>
  );
}
