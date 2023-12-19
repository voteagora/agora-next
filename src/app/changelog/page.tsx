import { formatFullDate } from "@/lib/utils";
import styles from "./changelog.module.scss";
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-full py-20 sm:pt-32 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:gap-32 ">
          <div className="lg:flex-1 lg:basis-1/3 max-w-xs rounded-xl border p-5 h-48 shadow-sm">
            <h2 className="mt-1 font-semibold text-stone-900">
              Agora Changelog
            </h2>
            <p className="mt-1 text-base leading-7 text-stone-600">
              Stay up to date with the latest changes with Agora&apos;s
              development. Please report bugs and feedback{" "}
              <a
                href="https://app.deform.cc/form/7180b273-7662-4f96-9e66-1eae240a52bc/"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                using this form
              </a>
              .
            </p>
          </div>
          <div
            className={cn(
              styles.changelogContainer,
              "lg:flex-1 lg:basis-2/3 mt-10 lg:mt-0 border-l pl-8 relative"
            )}
          >
            <div className="space-y-12">
              <div className={styles.changelogItem}>
                <p className={styles.changelogDate}>
                  {formatFullDate(new Date(2023, 11, 18))}
                </p>
                <h3 className={styles.changelogTitle}>
                  Agora Optimism V6 Governance Beta Launch 🚀 🎉
                </h3>
                <p>
                  Launch Day is here. The new Agora Beta Client for Optimism
                  governance is live at{" "}
                  <a href="httsp://opbeta.voteagora.com">
                    https://opbeta.voteagora.com
                  </a>
                  .
                </p>
                <p>
                  This new beta improves on the existing governance client and
                  adds:
                </p>
                <ul>
                  <li>Support for the new Optimism V6 Governor</li>
                  <li>Support for new Quorum and Proposal Types</li>
                  <li>
                    A robust voteable supply oracle to simplify proposal
                    creation
                  </li>
                  <li>Beta support for advanced delegation</li>
                  <li>Enhanced user interface for better user experience</li>
                  <li>Performance improvements</li>
                </ul>
                <p className={styles.changelogSubtitle}>
                  What does Beta support for Advanced Delegation Mean?
                </p>
                <p>
                  Advanced delegation is by far the most complex feature that
                  Agora has added to the Optimism goevrnance stack in 2023. The
                  idea is so simple and powerful, starting today, you are able
                  to take an EOA balance and partially delegate it to any number
                  of different addresses.
                </p>
                <p>
                  Gone are the days of fully delegating all of your voting
                  power, you can now give a little bit to many addresses, or a
                  lot to a few addresses. The choice is yours.
                </p>
                <p>
                  Given how different this is from existing delegation, we are
                  testing the feature with a smaller group of delegates over the
                  next few weeks, and this group will use it to vote during the
                  next round of votes in 2024. Once we are confident in the
                  mechanics on the client side (the contract is already
                  deployed), we will be rolling it out to more and more of the
                  OP community.
                </p>
                <p className={styles.changelogSubtitle}>What&lsquo;s next?</p>
                <p>
                  We will continue improving the beta client based on your
                  feedback and improving the advanced delegation experience. We
                  will also be adding more features to reach partity with our
                  existing client that lives at{" "}
                  <a
                    rel="noopener"
                    href="https://vote.optimism.io"
                    target="_blank"
                  >
                    https://vote.optimism.io
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
