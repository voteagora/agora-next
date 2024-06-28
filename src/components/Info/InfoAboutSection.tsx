import React from "react";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import Tenant from "@/lib/tenant/tenant";
import optimismSectionImg from "@/assets/optimism/info_about.png";
import uniswapSectionImg from "@/assets/uniswap/info_about.png";
import scrollSectionImg from "@/assets/scroll/info_about.png";

const about = {
  optimism: {
    description:
      "Both Houses make decisions through governance proposals. Proposals are accepted or rejected using a voting process. Anyone can submit a proposal to governance. The proposal must be one of the valid proposal types listed below, and it must follow the voting process described here.",
    sectionImage: optimismSectionImg,
    featureList: [
      {
        icon: icons.notificationMessage,
        title: "About Optimism",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.",
      },
      {
        icon: icons.checkCircleBroken,
        title: "Vote on proposals",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.",
      },
      {
        icon: icons.coins,
        title: "Get funded",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.",
      },
    ],
  },
  uniswap: {
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.",
    sectionImage: uniswapSectionImg,

    featureList: [
      {
        icon: icons.notificationMessage,
        title: "About Uniswap",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.",
      },
      {
        icon: icons.checkCircleBroken,
        title: "Vote on proposals",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.",
      },
      {
        icon: icons.coins,
        title: "Get funded",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.",
      },
    ],
  },
  scroll: {
    sectionImage: scrollSectionImg,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.",
    featureList: [
      {
        icon: icons.notificationMessage,
        title: "About Optimism",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.",
      },
      {
        icon: icons.checkCircleBroken,
        title: "Vote on proposals",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.",
      },
      {
        icon: icons.coins,
        title: "Get funded",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eu lectus dignissim, porta tortor nec.",
      },
    ],
  },
};

const InfoAboutSection = () => {
  const { namespace, ui } = Tenant.current();
  return (
    <>
      <h3 className="text-2xl font-black text-black mt-10">Getting started</h3>
      <div className="mt-4 rounded-xl border bg-white shadow-sm ">
        <div className="p-6 flex flex-row flex-wrap sm:flex-nowrap gap-6 mt-4">
          <Image
            src={about[namespace as keyof typeof about].sectionImage}
            alt="RetroPGF 3 results 4"
            className="w-full"
            height="366"
            width="172"
          />
          <div>
            <h3 className="text-lg font-bold text-black">About {namespace}</h3>
            <p className="text-base font-medium text-gray-4f mt-3">
              {about[namespace as keyof typeof about].description}
            </p>
          </div>
        </div>

        <div className="p-6  rounded-b-xl border-t bg-white">
          <h3 className="text-base font-bold text-black">Get involved</h3>
          <div className="flex flex-row  gap-6 flex-wrap sm:flex-nowrap">
            {about[namespace as keyof typeof about].featureList.map(
              (item, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-3 justify-center items-center mt-3"
                >
                  <div className="min-w-[72px] h-[72px] flex justify-center items-center rounded-full border bg-gray-eb">
                    <Image
                      src={item.icon}
                      width={24}
                      height={24}
                      alt="notification"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">
                      {item.title}
                    </h3>
                    <p className="text-sm font-normal">{item.description}</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoAboutSection;
