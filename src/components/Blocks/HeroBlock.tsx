import { HeroBlockConfig } from "@/lib/blocks/types";
import Image from "next/image";
import Link from "next/link";

interface HeroBlockProps {
  config: HeroBlockConfig;
}

export function HeroBlock({ config }: HeroBlockProps) {
  return (
    <div className="flex flex-col md:flex-col mt-12 gap-y-6 sm:gap-y-0 gap-x-0 sm:gap-x-6 flex-wrap sm:flex-nowrap lg:flex-row">
      <div className="flex flex-col w-full lg:w-2/5">
        <h1 className="font-black text-primary whitespace-pre-line text-4xl leading-[36px] sm:text-[40px] sm:leading-[40px]">
          {config.title}
        </h1>
        <p className="text-base text-secondary mt-4 whitespace-pre-line">
          {config.description}
        </p>
        {config.cta_text && config.cta_url && (
          <div className="mt-6">
            <Link
              href={config.cta_url}
              className="inline-block px-6 py-2.5 bg-buttonBackground text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {config.cta_text}
            </Link>
          </div>
        )}
      </div>

      {config.image_url && (
        <div className="w-full lg:flex-1 relative h-64 sm:h-96 lg:h-auto min-h-[300px] rounded-lg overflow-hidden">
          <Image
            src={config.image_url}
            alt={config.title}
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
