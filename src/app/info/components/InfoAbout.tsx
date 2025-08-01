import React from "react";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { CoinsIcon } from "@/icons/CoinsIcon";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { NotificationIcon } from "@/icons/NotificationIcon";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";

const { ui } = Tenant.current();

const tabs = [
  {
    icon: (
      <CoinsIcon
        className="w-[24px] h-[24px]"
        stroke={rgbStringToHex(ui.customization?.brandPrimary)}
      />
    ),
    title: "Delegate voting power",
    description:
      "The community is governed by its token holders, represented by trusted delegates.",
  },
  {
    icon: (
      <NotificationIcon
        className="w-[24px] h-[24px]"
        stroke={rgbStringToHex(ui.customization?.brandPrimary)}
      />
    ),
    title: "Browse proposals",
    description:
      "Governance decisions are initiated as proposals, providing insights into the priorities of the community.",
  },
  {
    icon: (
      <CheckCircleBrokenIcon
        className="w-[24px] h-[24px]"
        stroke={rgbStringToHex(ui.customization?.brandPrimary)}
      />
    ),
    title: "Vote on proposals",
    description:
      "Proposals that advance to a vote are accepted or rejected by the community’s delegates.",
  },
];

const InfoAbout = () => {
  const { namespace, ui, brandName } = Tenant.current();
  const page = ui.page("info/about");

  if (!page) {
    return <div>Page metadata not defined</div>;
  }

  const activeTabs = page.tabs || tabs;
  const sectionTitle = page.sectionTitle || "Getting started";

  return (
    <>
      <h3 className="text-2xl font-black text-primary mt-12">{sectionTitle}</h3>
      <div className="mt-4 rounded-xl border border-line bg-neutral shadow-sm">
        <div className="p-6 flex flex-row flex-wrap sm:flex-nowrap gap-6">
          <div className="w-full h-[200px] sm:h-auto sm:w-1/2 relative">
            <Image
              src={page.hero!}
              alt={page.title}
              fill
              className="rounded-lg object-cover object-center"
            />
          </div>
          <div className="sm:w-1/2">
            <h3 className="text-lg font-bold text-primary">
              {"About " + brandName}
            </h3>
            <p className="text-secondary mt-3">{page.description}</p>
            {/* So the image doesn't look smooshed for scroll :eye-roll: */}
            {namespace === TENANT_NAMESPACES.SCROLL && (
              <div className="sm:h-[105px] block"></div>
            )}
            {namespace === TENANT_NAMESPACES.B3 && (
              <div className="sm:h-[120px] block"></div>
            )}
          </div>
        </div>
        {namespace === TENANT_NAMESPACES.SCROLL && (
          <div className="p-6 border-t border-line">
            <div className="text-lg font-bold text-primary capitalize">
              Our approach to governance
            </div>
            <p className="text-secondary mt-3">
              <span className="italic">
                “A complex system that works is invariably found to have evolved
                from a simple system that worked.”
              </span>{" "}
              - John Gall.
            </p>
            <p className="text-secondary">
              With this in mind, our plan is first to set up a minimal
              governance structure, refine it, and iterate on first principles.
              Scroll’s governance system will accordingly start simple. This
              will leave plenty of room for experimentation in the future in
              order to keep the door open for broader collaboration in building
              our ecosystem. We aim to reach a place where the DAO is both
              highly decentralized, but still engages in thoughtful discourse
              and research, resulting in meaningful outcomes.
            </p>
          </div>
        )}
        <div className="p-6  rounded-b-xl bg-neutral border-t border-line">
          <div className="flex flex-row gap-6 flex-wrap sm:flex-nowrap mb-4">
            {activeTabs.map((item, index) => (
              <div
                key={index}
                className="flex flex-row gap-3 justify-center items-center mt-3"
              >
                <div className="min-w-[72px] h-[72px] flex justify-center items-center rounded-full border border-line bg-tertiary/10 flex sm:hidden lg:flex">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-primary">{item.title}</h3>
                  <p className="font-normal text-secondary">
                    {item.description}
                  </p>
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
