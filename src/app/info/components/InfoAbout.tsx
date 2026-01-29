import React from "react";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { CoinsIcon } from "@/icons/CoinsIcon";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { NotificationIcon } from "@/icons/NotificationIcon";
import { CheckCircleBrokenIcon } from "@/icons/CheckCircleBrokenIcon";

const { ui } = Tenant.current();

const defaultTabs = [
  {
    icon: (
      <CoinsIcon
        className="w-[24px] h-[24px]"
        stroke={
          ui.customization?.customIconColor ||
          rgbStringToHex(ui.customization?.brandPrimary)
        }
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
        stroke={
          ui.customization?.customIconColor ||
          rgbStringToHex(ui.customization?.brandPrimary)
        }
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
        stroke={
          ui.customization?.customIconColor ||
          rgbStringToHex(ui.customization?.brandPrimary)
        }
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

  const tabs = ui.customization?.customInfoTabs
    ? ui.customization.customInfoTabs.map((tab, index) => ({
        ...tab,
        icon: defaultTabs[index]?.icon,
      }))
    : defaultTabs;

  const activeTabs = page.tabs || tabs;
  const sectionTitle = page.sectionTitle || "Getting started";

  return (
    <>
      <h3 className="text-2xl font-black text-primary mt-12">{sectionTitle}</h3>
      <div
        className="mt-4 rounded-xl border border-line shadow-sm"
        style={{ backgroundColor: "var(--info-section-background)" }}
      >
        <div
          className={`p-6 flex flex-row flex-wrap sm:flex-nowrap ${ui.customization?.customInfoLayout ? ui.customization.customInfoLayout : "gap-6"}`}
        >
          {!ui.toggle("hide-hero-image")?.enabled && (
            <div
              className={`w-full sm:w-1/2 relative ${ui.customization?.customHeroImageSize ? ui.customization.customHeroImageSize : "h-[200px] sm:h-auto"}`}
            >
              <Image
                src={page.hero!}
                alt={page.title}
                fill
                className="rounded-lg object-cover object-center"
              />
            </div>
          )}
          <div
            className={`${ui.customization?.customInfoLayout ? "sm:w-auto sm:ml-2" : ui.toggle("hide-hero-image")?.enabled ? "w-full" : "sm:w-1/2"}`}
          >
            <div
              className={`${ui.customization?.customTextContainer ? ui.customization.customTextContainer : ""}`}
            >
              <h3 className="text-lg font-bold text-primary">
                {ui.customization?.customAboutSubtitle || "About " + brandName}
              </h3>

              {(() => {
                const desc = page.description;
                const paragraphClass = `text-secondary mt-3 ${ui.toggle("hide-hero-image")?.enabled ? "whitespace-pre-line" : ""}`;

                if (Array.isArray(desc)) {
                  return (
                    <ul className="text-secondary mt-3 list-disc pl-5">
                      {desc.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  );
                }

                return <p className={paragraphClass}>{String(desc)}</p>;
              })()}
            </div>
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
                &ldquo;A complex system that works is invariably found to have
                evolved from a simple system that worked.&rdquo;
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
        {!ui.toggle("hide-info-tabs")?.enabled && (
          <div className="p-6 rounded-b-xl border-t border-line bg-infoSectionBackground">
            <div className="flex lg:flex-row flex-col gap-6 flex-wrap sm:flex-nowrap mb-4">
              {activeTabs.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-3 justify-center items-center mt-3 flex-1 min-w-0"
                >
                  <div
                    className={`min-w-[72px] h-[72px] justify-center items-center rounded-full border border-line flex sm:hidden lg:flex ${ui.customization?.customIconBackground ? ui.customization.customIconBackground : "bg-tertiary/10"}`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">{item.title}</h3>
                    <p className={`font-normal text-secondary`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InfoAbout;
