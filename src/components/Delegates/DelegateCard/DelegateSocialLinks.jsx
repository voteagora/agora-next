import Image from "next/image";
import discordIcon from "@/icons/discord.svg";
import xIcon from "@/icons/x.svg";
import warpcastIcon from "@/icons/warpcast.svg";
import linkedinIcon from "@/icons/linkedin.svg";
import toast from "react-hot-toast";
import {
  buildLinkedinUrl,
  buildWarpcastUrl,
  isWarpcastAsLinkedin,
} from "@/lib/delegateStatement/socialLinks";

const ICON_HEIGHT = 24;
const ICON_WIDTH = 24;

export function DelegateSocialLinks({ discord, twitter, warpcast }) {
  const warpcastAsLinkedin = isWarpcastAsLinkedin();
  return (
    <div className="flex flex-row gap-4 h-auto w-max">
      {twitter && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window && window.open(`https://twitter.com/${twitter}`, "_blank");
          }}
        >
          <Image
            height={ICON_HEIGHT - 6}
            width={ICON_WIDTH - 6}
            src={xIcon.src}
            alt="x icon"
          />
        </button>
      )}

      {warpcast && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window &&
              window.open(
                warpcastAsLinkedin
                  ? buildLinkedinUrl(warpcast)
                  : buildWarpcastUrl(warpcast),
                "_blank"
              );
          }}
        >
          <Image
            height={ICON_HEIGHT}
            width={ICON_WIDTH}
            src={warpcastAsLinkedin ? linkedinIcon.src : warpcastIcon.src}
            alt={warpcastAsLinkedin ? "LinkedIn icon" : "Warpcast icon"}
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
    </div>
  );
}
