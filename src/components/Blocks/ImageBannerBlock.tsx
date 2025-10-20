import { ImageBannerBlockConfig } from "@/lib/blocks/types";
import Image from "next/image";

interface ImageBannerBlockProps {
  config: ImageBannerBlockConfig;
}

export function ImageBannerBlock({ config }: ImageBannerBlockProps) {
  const heightClasses = {
    small: "h-48 sm:h-64",
    medium: "h-64 sm:h-80 md:h-96",
    large: "h-80 sm:h-96 md:h-[32rem]",
    full: "h-screen",
  };

  const height = config.height || "medium";

  const overlayPositionClasses = {
    top: "items-start pt-12",
    center: "items-center",
    bottom: "items-end pb-12",
  };

  const position = config.overlay_position || "center";

  return (
    <div
      className={`relative w-full ${heightClasses[height]} rounded-xl overflow-hidden mt-6`}
    >
      <Image
        src={config.image_url}
        alt={config.alt_text || "Banner image"}
        fill
        className="object-cover"
        priority
      />
      {config.overlay_text && (
        <div
          className={`absolute inset-0 bg-black/40 flex ${overlayPositionClasses[position]} justify-center px-4`}
        >
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-black text-center">
            {config.overlay_text}
          </h2>
        </div>
      )}
    </div>
  );
}
