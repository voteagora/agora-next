import React from "react";
import Image from "next/image";
import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";
import { chivoMono, instrumentSerif } from "@/styles/fonts";
import civicHero from "@/assets/tenant/civic_hero.svg";
import civicInfo1 from "@/assets/tenant/civic_info_1.svg";
import civicInfoLogo from "@/assets/tenant/civic_info.svg";

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
  <div className="flex items-baseline justify-between gap-4">
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
    className={`${mono} absolute bottom-3 left-3 right-3 text-[8px] sm:text-[9px] uppercase tracking-[0.12em] text-white/90 drop-shadow`}
  >
    {children}
  </span>
);

const CivicInfoPage = () => {
  const { ui } = Tenant.current();
  const infoPage = ui.page("info");
  const links = infoPage?.links ?? [];

  return (
    <div className="mt-6 flex flex-col gap-10 text-primary sm:mt-8 sm:gap-12">
      {/* HERO */}
      <section className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative min-h-[280px] overflow-hidden rounded-2xl sm:min-h-[360px] lg:min-h-[420px]">
          <Image
            src={civicHero}
            alt="Center for Civilians in Conflict"
            fill
            className="object-cover"
            priority
          />
          <Caption>Photo: Usman Hanif</Caption>
        </div>
        <div className="flex flex-col">
          <MonoLabel className="text-brandPrimary">
            Community Engagement Platform
          </MonoLabel>
          <h1 className="mt-4 w-56 sm:w-72">
            <Image
              src={civicInfoLogo}
              alt="CIVIC Voice"
              className="h-auto w-full"
              priority
            />
          </h1>
          <p className="mt-6 max-w-md text-base leading-snug text-secondary sm:text-lg">
            This community engagement platform enables supporters to provide
            input on proposals, delegate voting power, and help shape
            CIVIC&apos;s strategic direction.
          </p>
        </div>
      </section>

      {/* NAV LINKS */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {links.map((link, index) => {
          const isExternal = link.url.startsWith("http");
          return (
            <Link
              key={link.name}
              href={link.url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer noopener" : undefined}
              className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-xl bg-wash px-5 py-6 transition-all duration-200 hover:shadow-newDefault"
            >
              <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-brandPrimary transition-transform duration-300 ease-out group-hover:scale-x-100" />
              <span className="flex items-baseline gap-3">
                <MonoLabel className="text-tertiary transition-colors group-hover:text-brandPrimary">
                  {String(index + 1).padStart(2, "0")}
                </MonoLabel>
                <span className="text-lg font-medium text-primary transition-transform duration-200 group-hover:translate-x-0.5">
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
        <div className="mt-5 text-base leading-relaxed text-secondary">
          <p>
            Center for Civilians in Conflict (CIVIC) promotes the protection of
            civilians in armed conflict across Africa, Europe, the Middle East,
            and through peacekeeping operations worldwide. CIVIC engages
            directly with armed actors, governments, and international
            institutions to develop practical guidance and policies that reduce
            civilian harm.
          </p>
        </div>
      </section>

      {/* BANNER */}
      <section className="relative min-h-[240px] overflow-hidden rounded-2xl sm:min-h-[320px]">
        <Image
          src={civicInfo1}
          alt="Center for Civilians in Conflict"
          fill
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-primary/40" />
        <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10">
          <h2
            className={`${serif} text-4xl leading-[1.05] text-white sm:text-6xl`}
          >
            Recognize. Prevent.
            <br />
            Protect. <span className="italic text-brandPrimary">Amend.</span>
          </h2>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span
            className={`${mono} text-[8px] uppercase tracking-[0.12em] text-white/90 drop-shadow sm:text-[9px]`}
          >
            Photo: Hajer Naili
          </span>
        </div>
      </section>

      {/* COLLABORATION */}
      <section>
        <SectionHeader title="About Our Collaboration" />
        <div className="mt-5 text-base leading-relaxed text-secondary">
          <p>
            Agora and CIVIC are joining forces to redefine community engagement
            and pave the way for a true implementation of blockchain
            philanthropy. Agora has availed its expertise and know-how to
            interact with the Web3 community through a unique and ideal
            platform. Through this pilot project, CIVIC aims to test several
            assumptions and determine how Web3 mechanisms can create deeper,
            more durable humanitarian participation than traditional donation
            models.
          </p>
          <p className="mt-4">
            We call on the Web3 community to make this pilot project a success,
            and a landmark to conceive future community engagement.
          </p>
        </div>
      </section>

      {/* ABOUT AGORA */}
      <section>
        <SectionHeader title="About Agora" />
        <p className="mt-5 text-base leading-relaxed text-secondary">
          Agora builds the infrastructure that powers onchain governance for
          leading communities and protocols. Our platform makes it simple to
          delegate voting power, create and vote on proposals, and coordinate
          decisions transparently — bringing the tools of modern governance to
          CIVIC&apos;s Supporter community.
        </p>
      </section>

      {/* PARTICIPATION */}
      <section>
        <SectionHeader
          title="How participation works"
          rightLabel="One Person, One Vote"
        />
        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
          {participation.map((item, index) => (
            <div
              key={item.title}
              className="flex flex-col rounded-xl bg-wash p-6"
            >
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

      {/* PRIVACY & DATA */}
      <section>
        <SectionHeader title="Privacy & Data" />
        <p className="mt-5 text-base leading-relaxed text-secondary">
          CIVIC and Agora do not sell or share your personal information with
          other organizations or third parties. You can unsubscribe from
          notifications in your profile settings, and delete your Supporter Pass
          account and personal data anytime in the app or by contacting{" "}
          <a
            href="mailto:giving@civiliansinconflict.org"
            className="text-brandPrimary hover:underline"
          >
            giving@civiliansinconflict.org
          </a>
          . The only data written to the blockchain is public key and vote
          information, which is anonymized and cannot be deleted.
        </p>
        <Link
          href="/info/privacy"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brandPrimary transition-colors hover:underline"
        >
          Read our full Privacy Policy →
        </Link>
      </section>
    </div>
  );
};

export default CivicInfoPage;
