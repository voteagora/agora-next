import React from "react";
import Image from "next/image";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";
import { chivoMono, instrumentSerif } from "@/styles/fonts";
import civicHero from "@/assets/tenant/civic_hero.svg";
import civicInfo1 from "@/assets/tenant/civic_info_1.svg";

const mono = chivoMono.className;
const serif = instrumentSerif.className;

const participation = [
  {
    kicker: "Supporter NFT",
    title: "Voting power",
    description:
      "CIVIC supporters can claim a free Supporter NFT that grants voting rights. Each member has equal voting power in all decisions.",
  },
  {
    kicker: "Community input",
    title: "Proposals",
    description:
      "Proposals are submitted for community input. Members can vote directly or delegate to representatives they trust.",
  },
  {
    kicker: "Quorum & approval",
    title: "Thresholds",
    description:
      "Community decisions require a quorum and approval threshold to pass, ensuring broad consensus.",
  },
];

const MonoLabel = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`${mono} text-[10px] sm:text-xs uppercase tracking-[0.15em] ${className}`}
  >
    {children}
  </span>
);

const SectionHeader = ({
  title,
  rightLabel,
}: {
  title: string;
  rightLabel?: string;
}) => (
  <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
    <h2 className="text-xl font-black leading-tight text-primary sm:text-2xl">
      {title}
    </h2>
    {rightLabel && (
      <MonoLabel className="hidden text-tertiary sm:block">
        {rightLabel}
      </MonoLabel>
    )}
  </div>
);

const Caption = ({ children }: { children: React.ReactNode }) => (
  <span
    className={`${mono} absolute bottom-3 left-3 right-3 text-[9px] sm:text-[10px] uppercase tracking-[0.12em] text-white/90 drop-shadow`}
  >
    {children}
  </span>
);

const CivicInfoPage = () => {
  const { ui } = Tenant.current();
  const infoPage = ui.page("info");
  const aboutPage = ui.page("info/about");
  const links = infoPage?.links ?? [];
  const contactEmail = aboutPage?.collaborationSection?.contactEmail;

  return (
    <div className="mt-6 sm:mt-8 border border-line bg-cardBackground text-primary divide-y divide-line">
      {/* HERO */}
      <section>
        <div
          className={`${mono} flex items-center justify-between gap-4 bg-primary px-4 py-2 text-[9px] sm:text-[11px] uppercase tracking-[0.15em] text-neutral`}
        >
          <span className="truncate">Recognize. Prevent. Protect. Amend.</span>
          <span className="hidden flex-shrink-0 sm:inline">
            One Person. One Vote
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y divide-line lg:divide-y-0 lg:divide-x lg:divide-line">
          <div className="relative min-h-[260px] sm:min-h-[320px] lg:min-h-[400px]">
            <Image
              src={civicHero}
              alt="Center for Civilians in Conflict"
              fill
              className="object-cover"
              priority
            />
            <Caption>Photo: Usman Hanif</Caption>
          </div>
          <div className="flex flex-col p-6 sm:p-8 lg:p-10">
            <MonoLabel className="text-brandPrimary">
              Community Engagement Platform
            </MonoLabel>
            <h1
              className={`${serif} mt-4 text-6xl sm:text-7xl lg:text-8xl leading-[0.9] text-primary`}
            >
              CIVIC <span className="italic">Voice</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-snug text-secondary sm:text-xl">
              This community engagement platform enables supporters to provide
              input on proposals, delegate voting power, and help shape
              CIVIC&apos;s strategic direction.
            </p>
          </div>
        </div>
      </section>

      {/* NAV LINKS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-line lg:divide-y-0">
        {links.map((link, index) => {
          const isExternal = link.url.startsWith("http");
          return (
            <Link
              key={link.name}
              href={link.url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer noopener" : undefined}
              className="group relative flex items-center justify-between gap-3 overflow-hidden px-5 py-7 transition-colors duration-200 hover:bg-wash"
            >
              <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-brandPrimary transition-transform duration-300 ease-out group-hover:scale-x-100" />
              <span className="flex items-baseline gap-3">
                <MonoLabel className="text-tertiary transition-colors group-hover:text-brandPrimary">
                  {String(index + 1).padStart(2, "0")}
                </MonoLabel>
                <span className="text-lg font-semibold text-primary transition-transform duration-200 group-hover:translate-x-0.5">
                  {link.title}
                </span>
              </span>
              <span className="text-tertiary transition-all duration-200 group-hover:translate-x-1 group-hover:text-brandPrimary">
                →
              </span>
            </Link>
          );
        })}
      </section>

      {/* ABOUT CIVIC */}
      <section>
        <SectionHeader title="About CIVIC" />
        <div className="border-t border-line p-6 sm:p-8">
          <div className="text-base leading-relaxed text-secondary sm:columns-2 sm:gap-10">
            <p>
              Center for Civilians in Conflict (CIVIC) promotes the protection
              of civilians in armed conflict across Africa, Europe, the Middle
              East, and through peacekeeping operations worldwide.
            </p>
            <p className="mt-4 sm:mt-0">
              CIVIC engages directly with armed actors, governments, and
              international institutions to develop practical guidance and
              policies that reduce civilian harm.
            </p>
          </div>
        </div>
      </section>

      {/* BANNER */}
      <section className="relative min-h-[240px] sm:min-h-[300px]">
        <Image
          src={civicInfo1}
          alt="Center for Civilians in Conflict"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/40" />
        <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10">
          <h2
            className={`${serif} text-4xl sm:text-6xl leading-[1.05] text-white`}
          >
            Recognize. Prevent.
            <br />
            Protect. <span className="italic text-brandPrimary">Amend.</span>
          </h2>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <MonoLabel className="text-white/90 drop-shadow">
            Photo: Hajer Naili
          </MonoLabel>
        </div>
      </section>

      {/* COLLABORATION */}
      <section>
        <SectionHeader title="About Our Collaboration" />
        <div className="border-t border-line p-6 sm:p-8">
          <div className="text-base leading-relaxed text-secondary sm:columns-2 sm:gap-10">
            <p>
              Agora and CIVIC are joining forces to redefine community
              engagement and pave the way for a true implementation of
              blockchain philanthropy. Agora has availed its expertise and
              know-how to interact with the Web3 community through a unique and
              ideal platform.
            </p>
            <p className="mt-4">
              Through this pilot project, CIVIC aims to test several assumptions
              and determine how Web3 mechanisms can create deeper, more durable
              humanitarian participation than traditional donation models.
            </p>
            <p className="mt-4">
              We call on the Web3 community to make this pilot project a
              success, and a landmark to conceive future community engagement.
            </p>
          </div>
        </div>
        {contactEmail && (
          <div className="border-t border-line px-6 py-5 sm:px-8">
            <MonoLabel className="text-tertiary">
              For questions or to request removal of your data, please contact{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-brandPrimary hover:underline"
              >
                {contactEmail.toUpperCase()}
              </a>
            </MonoLabel>
          </div>
        )}
      </section>

      {/* PARTICIPATION */}
      <section>
        <SectionHeader
          title="How participation works"
          rightLabel="One Person, One Vote"
        />
        <div className="grid grid-cols-1 border-t border-line lg:grid-cols-3 divide-y divide-line lg:divide-y-0 lg:divide-x lg:divide-line">
          {participation.map((item, index) => (
            <div key={item.title} className="flex flex-col p-6 sm:p-8">
              <MonoLabel className="text-tertiary">
                {String(index + 1).padStart(2, "0")}
              </MonoLabel>
              <h3 className="mt-4 text-xl font-semibold leading-tight text-primary">
                {item.title}
              </h3>
              <MonoLabel className="mt-3 text-brandPrimary">
                {item.kicker}
              </MonoLabel>
              <p className="mt-4 text-sm leading-relaxed text-secondary">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CivicInfoPage;
