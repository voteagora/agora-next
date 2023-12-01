import { HStack } from "@/components/Layout/Stack";
import Link from "next/link";
import Image from "next/image";
import discordIcon from "@/icons/discord.svg";
import twitterIcon from "@/icons/twitter.svg";

export function DelegateSocialLinks({ discord, twitter }) {
  return (
    <HStack gap="4" alignItems="center" className="h-auto items-center">
      {twitter && (
        <Link href={`https://twitter.com/${twitter}`}>
          <Image
            height={twitterIcon.height}
            width={twitterIcon.width}
            src={twitterIcon.src}
            alt="twitter"
          />
        </Link>
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
            height={discordIcon.height}
            width={discordIcon.width}
            src={discordIcon.src}
            alt="discord"
          />
        </button>
      )}
    </HStack>
  );
}
