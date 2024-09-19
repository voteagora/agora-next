import React from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";
import { icons } from "@/assets/icons/icons";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export const InfoHero = () => {
  const { ui, namespace } = Tenant.current();
  const page = ui!.page("info");

  const rotationClasses = ["-rotate-2", "rotate-4", "-rotate-5", "rotate-1"];

  return (
    <div className="flex flex-row mt-12 gap-6 flex-wrap sm:flex-nowrap">
      <div className="flex flex-col w-2/5">
        <h1 className="text-4xl sm:text-[50px] sm:leading-[50px] font-black text-primary">
          {page!.title}
        </h1>
        <p className="text-base text-secondary mt-4 sm:mt-4">
          {page!.description}

          {namespace === TENANT_NAMESPACES.NEW_DAO && (
            <Link href={"https://www.somesite.com"}>
              <Button className="bg-brandPrimary hover:bg-brandPrimary/90 mt-6 cursor-pointer block">
                .
              </Button>
            </Link>
          )}
        </p>
      </div>

      <div className="flex flex-row self-start justify-end w-3/5 gap-4">
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
    <Link
      target="_blank"
      href={link}
      className={`flex flex-col grow-0 p-1.5 bg-neutral border border-line rounded-[6px] shadow-[0px_3.044px_9.131px_0px_rgba(0,0,0,0.02),0px_1.522px_1.522px_0px_rgba(0,0,0,0.03)]} hover:rotate-0 transition-all hover:z-10 hover:scale-110 ${className}`}
    >
      <div className="relative h-[150px] w-[150px] aspect-square">
        <Image
          src={image}
          className="w-full rounded scale"
          fill={true}
          alt=""
        />
      </div>
      <div className="flex gap-1 items-center text-xs font-medium text-secondary mt-1.5">
        {linkText} <Image src={icons.northEast} width={9} height={9} alt="" />
      </div>
    </Link>
  );
};
