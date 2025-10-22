import { CardGridBlockConfig } from "@/lib/blocks/types";
import Image from "next/image";
import Link from "next/link";
import { icons } from "@/assets/icons/icons";

interface CardGridBlockProps {
  config: CardGridBlockConfig;
}

export function CardGridBlock({ config }: CardGridBlockProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  const rotationClasses = [
    "sm:-rotate-2",
    "sm:rotate-4",
    "sm:-rotate-5",
    "sm:rotate-1",
  ];

  return (
    <div className="flex flex-col md:flex-col mt-12 gap-y-6 sm:gap-y-0 gap-x-0 sm:gap-x-6 flex-wrap sm:flex-nowrap lg:flex-row">
      <div className="flex flex-col w-full lg:w-2/5">
        {config.title && (
          <h1 className="font-black text-primary text-4xl leading-[36px] sm:text-[40px] sm:leading-[40px]">
            {config.title}
          </h1>
        )}
        {config.description && (
          <p className="text-base text-secondary mt-4">{config.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-row md:w-fit md:flex-auto md:mx-auto self-start justify-between sm:justify-end w-full gap-4 sm:mt-4 lg:mt-0">
        {config.cards.map((card, index) => (
          <Link
            key={index}
            href={card.url}
            target={card.url.startsWith("http") ? "_blank" : undefined}
            rel={
              card.url.startsWith("http") ? "noopener noreferrer" : undefined
            }
            className={`flex flex-col grow-0 p-1.5 border border-line rounded-[6px] shadow-[0px_3.044px_9.131px_0px_rgba(0,0,0,0.02),0px_1.522px_1.522px_0px_rgba(0,0,0,0.03)] hover:rotate-0 transition-all hover:z-10 hover:scale-110 bg-cardBackground ${rotationClasses[index % rotationClasses.length]}`}
          >
            <div className="relative w-full aspect-square sm:aspect-auto sm:h-[130px] sm:w-[130px] lg:h-[150px] lg:w-[150px]">
              <Image
                src={card.image_url}
                alt={card.title}
                fill
                sizes="(max-width: 640px) 50vw, 150px"
                className="w-full rounded object-cover"
              />
            </div>
            <div className="w-full flex flex-row justify-between gap-1 items-center text-xs font-medium text-secondary mt-1.5">
              <span>{card.title}</span>
              <Image
                src={icons.northEast}
                width={12}
                height={12}
                alt="external link"
                className="self-start mt-1 flex-shrink-0"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
