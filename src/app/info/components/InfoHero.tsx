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

  const rotationClasses = [
    "sm:-rotate-2",
    "sm:rotate-4",
    "sm:-rotate-5",
    "sm:rotate-1",
  ];

  return (
    <div className="flex flex-col md:flex-col mt-12 gap-y-6 sm:gap-y-0 gap-x-0 sm:gap-x-6 flex-wrap sm:flex-nowrap lg:flex-row">
      <div className="flex flex-col w-full lg:w-2/5">
        <h1 className="text-4xl leading-[36px] sm:text-[40px] sm:leading-[40px] font-black text-primary">
          {page!.title}
        </h1>
        <p className="text-base text-secondary mt-4">
          {page!.description}
          {namespace === TENANT_NAMESPACES.SCROLL && (
            <div className="flex flex-row gap-2 mt-4">
              <Link href={"https://scroll.io/sessions"}>
                <Button className="bg-brandPrimary hover:bg-brandPrimary/90 cursor-pointer block">
                  Join Session 2
                </Button>
              </Link>
              <Link href={"https://claim.scroll.io/faq"}>
                <Button className="bg-wash text-primary border border-line hover:bg-wash/90 hover:text-secondary cursor-pointer block">
                  FAQ
                </Button>
              </Link>
            </div>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-row md:w-fit md:flex-auto md:mx-auto self-start justify-between sm:justify-end w-full gap-4 sm:mt-4 lg:mt-0">
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
      <div className="relative w-full sm:h-[130px] sm:w-[130px] lg:h-[150px] lg:w-[150px] aspect-square">
        <Image
          src={image}
          className="w-full rounded scale"
          fill={true}
          alt=""
        />
      </div>
      <div className="w-full flex flex-row justify-between gap-1 items-center text-xs font-medium text-secondary mt-1.5">
        <span>{linkText}</span>
        <Image
          src={icons.northEast}
          width={12}
          height={12}
          alt="arrow pointing right"
          className="self-start mt-1"
        />
      </div>
    </Link>
  );
};
