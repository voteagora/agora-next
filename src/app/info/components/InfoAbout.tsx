import React from "react";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import Tenant from "@/lib/tenant/tenant";

import optimismInfoAbout from "@/assets/tenant/optimism_info_about.png";
import uniswapInfoAbout from "@/assets/tenant/uniswap_info_about.png";

// TODO: This needs to be refactored to use the Tenant UI object
const infoAbout = {
  optimism: {
    description:
      "Both Houses make decisions through governance proposals. Proposals are accepted or rejected using a voting process. Anyone can submit a proposal to governance. The proposal must be one of the valid proposal types listed below, and it must follow the voting process described here.",
    sectionImage: optimismInfoAbout,
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
      "The Uniswap protocol is a peer-to-peer system designed for exchanging cryptocurrencies. The protocol is implemented as a set of persistent, non-upgradable smart contracts; designed to prioritize censorship resistance, security, self-custody, and to function without any trusted intermediaries who may selectively restrict access. The Uniswap Protocol is a public good owned and governed by UNI token holders.",
    sectionImage: uniswapInfoAbout,

    featureList: [
      {
        icon: icons.coins,
        title: "Delegate voting power",
        description:
          "The collective is governed by the project’s token holders who are represented by delegates.",
      },
      {
        icon: icons.notificationMessage,
        title: "Browse proposals",
        description:
          "Governance decisions begin as proposals and are a lens into the community’s priorities.",
      },
      {
        icon: icons.checkCircleBroken,
        title: "Vote on proposals",
        description:
          "Proposals that move to a vote are accepted or rejected by delegates.",
      },
    ],
  },
};

const About = () => {
  const { namespace } = Tenant.current();

  return (
    <>
      <h3 className="text-2xl font-black text-black mt-10">Getting started</h3>
      <div className="mt-4 rounded-xl border bg-white shadow-sm ">
        <div className="p-6 flex flex-row flex-wrap sm:flex-nowrap gap-6">
          <Image
            src={infoAbout[namespace as keyof typeof infoAbout].sectionImage}
            alt={`About ${namespace}`}
            className="w-full rounded-lg"
            height="366"
            width="172"
          />
          <div>
            <h3 className="text-lg font-bold text-black">About {namespace}</h3>
            <p className="text-base font-medium text-gray-4f mt-3">
              {infoAbout[namespace as keyof typeof infoAbout].description}
            </p>
          </div>
        </div>

        <div className="p-6  rounded-b-xl border-t bg-white">
          <div className="flex flex-row gap-6 flex-wrap sm:flex-nowrap mb-4">
            {infoAbout[namespace as keyof typeof infoAbout].featureList.map(
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

export default About;
