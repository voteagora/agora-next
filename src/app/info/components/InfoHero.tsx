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
      <div
        className={`flex flex-col w-full ${ui.customization?.customTitleSize ? "lg:w-3/5" : "lg:w-2/5"}`}
      >
        <h1
          className={`font-black text-primary whitespace-pre-line ${ui.customization?.customTitleSize || "text-4xl leading-[36px] sm:text-[40px] sm:leading-[40px]"}`}
        >
          {page!.title}
        </h1>
        {ui.toggle("towns-hero-content")?.enabled ? (
          <div className="text-base text-secondary mt-4">
            <div className="whitespace-pre-line">{page!.description}</div>
            <div className="mt-4">
              <a
                href="#duna-administration"
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-[#3A3454] text-white rounded-[40px] hover:bg-[#3A3454]/90 transition-colors cursor-pointer text-sm sm:text-base"
              >
                <svg
                  width="14"
                  height="14"
                  className="sm:w-4 sm:h-4 flex-shrink-0 text-red-500"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 4V6M8 8V12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="whitespace-normal text-red-500 font-bold">
                  View Towns Lodge DUNA Member{" "}
                  <span className="underline">Disclosure</span>
                </span>
              </a>
            </div>
          </div>
        ) : ui.toggle("syndicate-hero-content")?.enabled ? (
          <div className="text-base text-secondary mt-4">
            <div className="whitespace-pre-line">{page!.description}</div>
            <div className="mt-4">
              <a
                href="#duna-administration"
                className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-white text-black rounded-[40px] hover:bg-gray-50 transition-colors cursor-pointer text-sm sm:text-base"
              >
                <svg
                  width="14"
                  height="14"
                  className="sm:w-4 sm:h-4 flex-shrink-0 text-red-500"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 4V6M8 8V12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="whitespace-normal text-red-500 font-bold">
                  View Syndicate DUNA Member{" "}
                  <span className="underline">Disclosures</span>
                </span>
              </a>
            </div>
          </div>
        ) : (
          <p className="text-base text-secondary mt-4">
            {page!.description}
            {namespace === TENANT_NAMESPACES.SCROLL && (
              <div className="flex flex-row gap-2 mt-4">
                <Link href={"https://claim.scroll.io/faq"}>
                  <Button className="bg-wash text-primary border border-line hover:bg-wash/90 hover:text-secondary cursor-pointer block">
                    FAQ
                  </Button>
                </Link>
              </div>
            )}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-row md:w-fit md:flex-auto md:mx-auto self-start justify-between sm:justify-end w-full gap-4 sm:mt-4 lg:mt-0">
        {page!.links!.map((link, idx) => (
          <Card
            className={rotationClasses[idx % rotationClasses.length]}
            image={link.image || ""}
            key={`card-${idx}`}
            link={link.url}
            linkText={link.title}
            ui={ui}
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
  ui,
}: {
  className?: string;
  link: string;
  linkText: string;
  image: StaticImageData | string;
  ui: any;
}) => {
  const isDisabled = link === "" && ui.dunaDisclaimers;

  return (
    <div className="relative">
      <Link
        target="_blank"
        href={link}
        className={`flex flex-col grow-0 p-1.5 border border-line rounded-[6px] shadow-[0px_3.044px_9.131px_0px_rgba(0,0,0,0.02),0px_1.522px_1.522px_0px_rgba(0,0,0,0.03)] hover:rotate-0 transition-all hover:z-10 hover:scale-110 bg-cardBackground ${className} ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div
          className={`relative w-full aspect-square ${ui.customization?.customCardSize || "sm:h-[130px] sm:w-[130px] lg:h-[150px] lg:w-[150px]"}`}
        >
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
            className={`self-start mt-1 ${ui.customization?.infoSectionBackground ? (ui.customization.infoSectionBackground === "#FFFFFF" ? "brightness-0" : "brightness-0 invert") : ""} ${isDisabled ? "opacity-50" : ""}`}
          />
        </div>
      </Link>
    </div>
  );
};
