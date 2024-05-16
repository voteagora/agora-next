import { HStack } from "@/components/Layout/Stack";
import Image from "next/image";
import discordIcon from "@/icons/discord.svg";
import twitterIcon from "@/icons/twitter.svg";
import warpcastIcon from "@/icons/warpcast.svg";
import toast from "react-hot-toast";

const ICON_HEIGHT = 32;
const ICON_WIDTH = 32;

export function DelegateSocialLinks({ discord, twitter, warpcast }) {
  return (
    <HStack gap="4" alignItems="center" className="h-auto items-center">
      {twitter && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window && window.open(`https://twitter.com/${twitter}`, "_blank");
          }}
        >
          <Image
            height={ICON_HEIGHT}
            width={ICON_WIDTH}
            src={twitterIcon.src}
            alt="twitter icon"
          />
        </button>
      )}

      {warpcast && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window && window.open(`https://warpcast.com/${warpcast}`, "_blank");
          }}
        >
          <Image
            height={ICON_HEIGHT}
            width={ICON_WIDTH}
            src={warpcastIcon.src}
            alt="Warpcast icon"
          />
        </button>
      )}

      {discord && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast("copied discord handle to clipboard");
            navigator.clipboard.writeText(discord);
          }}
        >
          <Image
            height={ICON_HEIGHT}
            width={ICON_WIDTH}
            src={discordIcon.src}
            alt="discord icon"
          />
        </button>
      )}
    </HStack>
  );
}
