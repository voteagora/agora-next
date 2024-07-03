import React from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";
import { icons } from "@/assets/icons/icons";

export const InfoHero = () => {
  const { ui } = Tenant.current();
  const page = ui!.page("info");

  const rotationClasses = ["-rotate-2", "rotate-4", "-rotate-5", "rotate-1"];

  return (
    <div className="flex flex-row mt-10 gap-11 flex-wrap sm:flex-nowrap">
      <div className="flex flex-col">
        <h1 className="text-4xl sm:text-[56px] sm:leading-[67px] font-black text-black">
          {page!.title}
        </h1>
        <p className="text-base font-medium text-gray-4f mt-2 sm:mt-0 ">
          {page!.description}
        </p>
      </div>
      <div className="flex flex-row">
        {page!.links!.map((link, idx) => (
          <Card
            className={rotationClasses[idx % rotationClasses.length]}
            image={link.image || ""}
            key={`card-${idx}`}
            link={link.url}
            linkText={link.title}
          />
        ))}
      </div>
    </div>
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
  image: StaticImageData | string;
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
