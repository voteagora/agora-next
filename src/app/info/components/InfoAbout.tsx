import React from "react";
import Image from "next/image";
import { icons } from "@/assets/icons/icons";
import Tenant from "@/lib/tenant/tenant";

const tabs = [
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
];

const InfoAbout = () => {
  const { namespace, ui } = Tenant.current();
  const page = ui.page("info/about");

  if (!page) {
    return <div>Page metadata not defined</div>;
  }

  return (
    <>
      <h3 className="text-2xl font-black text-primary mt-10">
        Getting started
      </h3>
      <div className="mt-4 rounded-xl bg-neutral shadow-sm">
        <div className="p-6 flex flex-row flex-wrap sm:flex-nowrap gap-6">
          <Image
            src={page.hero!}
            alt={page.title}
            className="w-full rounded-lg"
            height="366"
          />
          <div>
            <h3 className="text-lg font-bold text-primary capitalize">
              About {namespace}
            </h3>
            <p className="text-base font-medium text-gray-4f mt-3">
              {page.description}
            </p>
          </div>
        </div>

        <div className="p-6  rounded-b-xl bg-neutral border-t border-line">
          <div className="flex flex-row gap-6 flex-wrap sm:flex-nowrap mb-4">
            {tabs.map((item, index) => (
              <div
                key={index}
                className="flex flex-row gap-3 justify-center items-center mt-3"
              >
                <div className="min-w-[72px] h-[72px] flex justify-center items-center rounded-full border border-line">
                  <Image
                    src={item.icon}
                    width={24}
                    height={24}
                    alt="notification"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary">
                    {item.title}
                  </h3>
                  <p className="text-sm font-normal">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoAbout;
