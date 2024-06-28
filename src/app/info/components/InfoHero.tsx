import React from "react";
import Image from "next/image";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";
import { icons } from "@/assets/icons/icons";
import { HStack, VStack } from "@/components/Layout/Stack";

const heroCardsData = {
  optimism: [
    {
      image: "/images/info/optimism_1.png",
      linkText: "Community Discord",
      link: "",
    },
    {
      image: "/images/info/optimism_2.png",
      linkText: "Governance Forums",
      link: "",
    },
    {
      image: "/images/info/optimism_3.png",
      linkText: "Protocol Docs",
      link: "",
    },
    {
      image: "/images/info/optimism_4.png",
      linkText: "Optimistic Vision",
      link: "",
    },
  ],
  uniswap: [
    {
      image: "/images/info/uniswap_1.png",
      linkText: "Community Discord",
      link: "https://discord.com/invite/FCfyBSbCU5",
    },
    {
      image: "/images/info/uniswap_2.png",
      linkText: "Governance Forums",
      link: "https://gov.uniswap.org/",
    },
    {
      image: "/images/info/uniswap_3.png",
      linkText: "Protocol Docs",
      link: "https://docs.uniswap.org",
    },
    {
      image: "/images/info/uniswap_4.png",
      linkText: "Uniswap Labs",
      link: "https://x.com/Uniswap",
    },
  ],
  scroll: [
    {
      image: "/images/info/scroll_1.png",
      linkText: "Community Discord",
      link: "",
    },
    {
      image: "/images/info/scroll_2.png",
      linkText: "Governance Forums",
      link: "",
    },
    {
      image: "/images/info/scroll_3.png",
      linkText: "Protocol Docs",
      link: "",
    },
    {
      image: "/images/info/scroll_4.png",
      linkText: "Ecosystem",
      link: "",
    },
  ],
};

const InfoHero = () => {
  const { namespace, ui } = Tenant.current();
  const { title, description } = ui.page("info");

  return (
    <HStack className="mt-10 gap-11 flex-wrap sm:flex-nowrap">
      <VStack>
        <h1 className="text-4xl sm:text-[56px] sm:leading-[67px] font-black text-black">
          {title}
        </h1>
        <p className="text-base font-medium text-gray-4f mt-2 sm:mt-0 ">
          {description}
        </p>
      </VStack>
      <HStack>
        {heroCardsData[namespace as keyof typeof heroCardsData].map(
          (card, index) => (
            <Card
              key={index}
              image={card.image}
              link={card.link}
              linkText={card.linkText}
              className={
                index === 0
                  ? "-rotate-2"
                  : index === 1
                    ? "rotate-4"
                    : index === 2
                      ? "-rotate-5"
                      : "rotate-1"
              }
            />
          )
        )}
      </HStack>
    </HStack>
  );
};

const Card = ({
  className,
  link,
  linkText,
  image,
}: {
  className?: string;
  link: string;
  linkText: string;
  image: string;
}) => {
  return (
    <div
      className={`p-1.5 w-full sm:w-32  bg-white border border-gray-300 rounded-[6px] shadow-[0px_3.044px_9.131px_0px_rgba(0,0,0,0.02),0px_1.522px_1.522px_0px_rgba(0,0,0,0.03)]} ${className}`}
    >
      <Image src={image} className="w-full" width={106} height={106} alt="" />
      <Link
        className=" flex gap-1 items-center text-[9px] font-medium leading-[12px] text-gray-4f mt-3 "
        target="_blank"
        href={link}
      >
        {linkText} <Image src={icons.northEast} width={9} height={9} alt="" />
      </Link>
    </div>
  );
};

export default InfoHero;
