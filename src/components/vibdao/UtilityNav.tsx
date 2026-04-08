import Link from "next/link";
import { ArrowRight, Coins, PiggyBank, WalletCards } from "lucide-react";

const links = [
  {
    href: "/donate",
    title: "Donate",
    description: "Mint local VIB voting power by donating DOT into treasury.",
    Icon: PiggyBank,
  },
  {
    href: "/fellowship",
    title: "Fellowship",
    description: "Review fellows, salary history, and treasury transfers.",
    Icon: Coins,
  },
  {
    href: "/claim",
    title: "Claim",
    description: "Advance blocks locally and claim released fellow salary.",
    Icon: WalletCards,
  },
];

export function UtilityNav() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group rounded-2xl border border-line bg-neutral shadow-newDefault p-5 flex flex-col gap-4 transition-all hover:-translate-y-0.5 hover:bg-wash"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-white">
                <link.Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-primary">
                {link.title}
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          </div>
          <span className="text-sm leading-6 text-secondary">
            {link.description}
          </span>
        </Link>
      ))}
    </div>
  );
}
