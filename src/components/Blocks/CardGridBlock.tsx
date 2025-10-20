import { CardGridBlockConfig } from "@/lib/blocks/types";
import Image from "next/image";
import Link from "next/link";

interface CardGridBlockProps {
  config: CardGridBlockConfig;
}

export function CardGridBlock({ config }: CardGridBlockProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <>
      {config.title && (
        <h3 className="text-2xl font-black text-primary mt-12">
          {config.title}
        </h3>
      )}
      <div
        className={`grid grid-cols-1 ${gridCols[config.columns]} gap-4 mt-4`}
      >
        {config.cards.map((card, index) => (
          <Link
            key={index}
            href={card.url}
            target={card.url.startsWith("http") ? "_blank" : undefined}
            className="group flex flex-col p-1.5 border border-line rounded-lg shadow-sm hover:shadow-md transition-all bg-cardBackground"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded">
              <Image
                src={card.image_url}
                alt={card.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="w-full flex flex-col gap-1 mt-1.5 px-1">
              <h3 className="text-sm font-medium text-primary">{card.title}</h3>
              {card.description && (
                <p className="text-xs text-secondary line-clamp-2">
                  {card.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
