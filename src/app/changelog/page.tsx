import { formatFullDate } from "@/lib/utils";
import styles from "./changelog.module.scss";
import { cn } from "@/lib/utils";

export async function generateMetadata() {
  return {
    title: "Optimism Gov Client Changelog - Agora",
    description:
      "Stay up to date with the latest changes with Agora's development for the Optimism community.",
  };
}

export default function Page() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-full py-20 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:gap-32 ">
          <div className="sm:flex-1 sm:basis-1/3 max-w-xs rounded-xl border p-5 h-48 shadow-sm">
            <h2 className="mt-1 font-semibold text-stone-900">
              Agora Changelog
            </h2>
            <p className="mt-1 text-base leading-7 text-stone-600">
              Stay up to date with the latest changes with Agora&apos;s
              development. Please report bugs and feedback{" "}
              <a
                href="https://agora.deform.cc/bugreport/"
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
              "sm:flex-1 sm:basis-2/3 mt-10 sm:mt-0 border-l pl-8 relative"
            )}
          >
            <div className="flex items-center bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
              <div>
                <p className="font-semibold">Agora Optimism Office Hours</p>
                <p className="text-sm">
                  Join us for a monthly Google Meet where we discuss all things
                  OP governance related. <br />
                  <a
                    target="_blank"
                    href="https://calendar.google.com/calendar/embed?src=c_03628eb023f9d4248847ce6758abb80aec7d6a1c9b20bb7ef939c45054963437%40group.calendar.google.com&ctz=America%2FToronto"
                  >
                    <u>View Google Calendar link.</u>
                  </a>
                </p>
              </div>
            </div>
            <div className="my-8 border-t border-gray-300"></div>
            <div>
              <div className={styles.changelogItem}>
                <p id="changelogfeb2024" className={styles.changelogDate}>
                  {formatFullDate(new Date(2024, 2, 27))}
                </p>
                <h3 className={styles.changelogTitle}>
                  Governance Client Changelog #3
                </h3>
                <p>Morning OP collective,</p>
                <p>
                  The past few weeks were all about dates and UX polish. Most of
                  what we shipped was centered around making it easier for you
                  know which voting cylce we are in, and what is coming up. We
                  also worked on a few lingering bugs and UX improvements.
                </p>
                <p>
                  On the API side, we are happy announce that we are bringing
                  the OP API back in June of 2024 and have assemlbed a working
                  group of teams and individuals that used the API during
                  RetroPGF Round 3. Stay tuned for more details here, in Discord
                  and on X.
                </p>
                <p>
                  On the contract side, we have a few audits underway for some
                  contract upgrades that we will be bringing to governance soon
                  for a vote. Excited to share more then.
                </p>
                <p>
                  Keep letting us know if you have any other feedback or run
                  into any issues. We are here to serve.
                </p>
                <p>All the best,</p>
                <p>
                  <a href="https://twitter.com/kentf">Kent</a>, Co-founder at{" "}
                  <a href="https://voteagora.com">Agora</a>
                </p>
                <br />
                <br />
                <h4>Major updates</h4>
                <ul>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/bc4ea97b4ac1dd11cdb9cde99dcae1536402e0c9"
                        target="_blank"
                      >
                        Name Abstraction
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/b74ef1d5127b748eed19fb0c2df1217bd5411572"
                        target="_blank"
                      >
                        Display Exact Date in Proposal
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/cb8196a97a44775a0582f34325484f0d13c17a97"
                        target="_blank"
                      >
                        Added Current Governance Stage to Proposal Page
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/5d05acd03ecd7705ccd84465146439e45b4a33bd"
                        target="_blank"
                      >
                        Integrate OpenTelemetry in Agora App
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/e8629ef5654f7f48ef2cd0deb12de2f969413677"
                        target="_blank"
                      >
                        Allowed Concurrent Execution of Delegate Query
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/7cedfcfc142e846cc7a5631cfec1b8033992832e"
                        target="_blank"
                      >
                        Sort Citizens with Most Voting Power
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/0c556c59f5c886044383006fec1b2e0191428bf6"
                        target="_blank"
                      >
                        Allow 2+ Votes if Voter hasnt voted with direct VP
                      </a>
                    </p>
                  </li>
                </ul>

                <br />
                <h4>Minor updates</h4>
                <ul>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/1836bff2ccaf593c71c2bc9cc217dd61aa15a54e"
                        target="_blank"
                      >
                        Prop Type Forms
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/a8ef0a289cf586b0024d3e419a1b896904aa3b6a"
                        target="_blank"
                      >
                        Tenant Abstraction Contracts
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/a86eb751971e2b572742ed4a62faf346c80d9b57"
                        target="_blank"
                      >
                        UI Improvements
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/7ff67e8e2f61993e6eb72c7d2d5bbba2f2a7b2cb"
                        target="_blank"
                      >
                        Delegate Performance Optimization
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/8d630b784d3ee0ce202164df33c34ce69b368469"
                        target="_blank"
                      >
                        Re-use Caching on Components and API
                      </a>
                    </p>
                  </li>
                </ul>

                <br />
                <h4>Bug fixes</h4>
                <ul>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/1c076587e2c32b4e31fd9d09edb2f36a45d0bdda"
                        target="_blank"
                      >
                        Fixed Allowance Calculation Logic for Votes
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/a1e974d53c7db6cc36ff64ba5629943ad99d44e9"
                        target="_blank"
                      >
                        Refactoring
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/b74f7ab5fbc88cf92536cc907e849692baff5867"
                        target="_blank"
                      >
                        Voting Cast Not Executing
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/6342ae2cbeab72d5f27daa5b0c7720df2261416d"
                        target="_blank"
                      >
                        Delegates Undefined Bug Fix
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/pull/178"
                        target="_blank"
                      >
                        Conditional Check for Delegate Statement creation for
                        wallet
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/4cc8909ba5d56bcb891e8567dd2621243730dc09"
                        target="_blank"
                      >
                        Fix Optimistic Proposal Ids
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/8772c435ff4c4dec21a817aede6767953a80ce23"
                        target="_blank"
                      >
                        Fix Requests being cancelled when trying to vote
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/f5203c218dad08e28e84dc3b62c6188ae204f22c"
                        target="_blank"
                      >
                        Fix Non Clickable Div of Past Votes in Delegates/Address
                        Page
                      </a>
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <div className="my-8 border-t border-gray-300"></div>
            <div>
              <div className={styles.changelogItem}>
                <p id="changelogfeb2024" className={styles.changelogDate}>
                  {formatFullDate(new Date(2024, 2, 7))}
                </p>
                <h3 className={styles.changelogTitle}>
                  Governance Client Changelog #2
                </h3>
                <p>Morning OP collective,</p>
                <p>
                  There was a lot of action behind the scenes this past few
                  weeks as we identified a few edges cases in advanced voting
                  that we will need to fix with a contract update. More on that
                  soon.
                </p>
                <p>
                  We have also been working on making a bunch of backend speed
                  improvements. We aren&apos;t quite done yet but you should see
                  the Proposals page load 10% faster and we are looking to take
                  that down to 50% faster soon.
                </p>
                <p>
                  Behind the scenes our team has been connecting with dozens of
                  individuals and teams that have questions about pulling data
                  from the chain. We have been working with them and setting up
                  better documentation too.
                </p>
                <p>
                  One the client side, the biggest changes we added were
                  Proposal list filtering and some date and time sugar to make
                  it easier to know when a vote is starting and when it&apos;s
                  ending.
                </p>
                <p>
                  Keep letting us know if you have any other feedback or run
                  into any issues. We are here to serve.
                </p>
                <p>All the best,</p>
                <p>
                  <a href="https://twitter.com/kentf">Kent</a>, Co-founder at{" "}
                  <a href="https://voteagora.com">Agora</a>
                </p>
                <br />
                <br />
                <h4>Major updates</h4>
                <ul>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/510df82d354a2f690710d7f3dbb162594e64c663"
                        target="_blank"
                      >
                        Proposal Filtering on Index
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/b8157659a89149c897efbcf5b895d768d4b0d9dd"
                        target="_blank"
                      >
                        Fixed Date & Proposal Time for Proposal Details
                      </a>
                    </p>
                  </li>
                </ul>
                <br />
                <h4>Minor updates</h4>
                <ul>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/826eb8defd2e453cc2f2247f73e334bfe930faaa"
                      >
                        Create Proposal UI fix
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/7b81fb61f7fa9bdeb23093915b1ae563184836c0"
                      >
                        Fixed Error Display Loud on Proposal Creation
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/0230f088825164a4aaf35711d051b7751b7fc927"
                      >
                        Fix Responsive Design edge cases
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/34fca3ce5e2875bbd947bd2c734686ec23ad6ffa"
                      >
                        Added tx Hash explorer url to every vote
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/226fdc56959b3c02a52e28b697ace8750ce76cfa"
                      >
                        Fixed Infinite Scroll Clean up
                      </a>
                    </p>
                  </li>
                </ul>
                <br />
                <h4>Bug fixes</h4>
                <ul>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/35e5946a6a9d349ba34d76653236761d089d5cdf"
                      >
                        Fixed BudgetTokenSpent & BudgetAmount Format
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/19a1a8601274adb8d9dc92152d6e0e44aae59f89"
                      >
                        Mobile UI Fix
                      </a>
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <div className="my-8 border-t border-gray-300"></div>
            <div>
              <div className={styles.changelogItem}>
                <p id="changelogfeb2024" className={styles.changelogDate}>
                  {formatFullDate(new Date(2024, 1, 23))}
                </p>
                <h3 className={styles.changelogTitle}>
                  Governance Client Changelog #1
                </h3>
                <p>Good morning OP collective,</p>
                <p>
                  We have been hard at work making this app worthy of the
                  community we serve and hopefully from the list of changes and
                  bugs that we have fixed, hopefully you will agree.
                </p>
                <p>
                  We will be providing these updates each week. Sometimes we
                  will have much to say and sometimes less, but always the
                  latest commits and areas of improvements we are looking to
                  make better in the coming week.
                </p>
                <p>
                  Since the launch, most of our time has been centered around
                  one thing, hardening our advanced delegation beta and advanced
                  voting. This allows for our beta users to break their
                  delegations into fractional pieces and then vote with those
                  pieces. We are still looking to make that process even easier
                  and bring down the number of transactions for delegates with
                  advanced delegations to vote from 2 to 1, and that will come
                  soon.
                </p>
                <p>
                  We have also been making small updates to performance issues
                  we noticed in the delegation and proposal rendering pipelines,
                  along with some improvements to how we handle delegate cards.
                </p>
                <p>
                  Finally, we have robust new preview image support for X,
                  Farcaster, LinkedIn and other social platforms.{" "}
                </p>
                <p>
                  Don&apos;t forget to follow us and tag us in the chats on
                  Discord.
                </p>
                <p>All the best,</p>
                <p>
                  <a href="https://twitter.com/kentf">Kent</a>, Co-founder at{" "}
                  <a href="https://voteagora.com">Agora</a>
                </p>
                <br />
                <br />
                <h4>Major updates</h4>
                <ul>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/pull/41"
                        target="_blank"
                      >
                        Tracked and displayed Recent Activity of past 10 votes
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/920f949fb8dfde39f2525578a0ad2321c6afedeb"
                        target="_blank"
                      >
                        Added Profile Dropdown Dialog and Button in header
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/67cdbb7dda224995823327c610940190dbbd9e70"
                        target="_blank"
                      >
                        Optimistic proposals in Home Page
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/6750476f446545a631b428fadd27b8c58d43795c"
                        target="_blank"
                      >
                        Optimistic Proposal Creation
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/2c6f292dc524374b793b14a8abc53ad2efca09fd"
                        target="_blank"
                      >
                        Optimistic Proposal Page
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/b9b14058fcae51f7a80e1133f33c12ff1383fde0"
                        target="_blank"
                      >
                        OP delegate should be able to vote on an approval
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/pull/56"
                        target="_blank"
                      >
                        Added RetroPGF Summary Page to Next
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/pull/51"
                        target="_blank"
                      >
                        Added Hovercard over delegate on Vote Table View
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/f7678e7b3b073544d9035b43e7afc542b07e15ed"
                        target="_blank"
                      >
                        Added WalletConnect Domain Verification Code
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/d324e6494f2998af339d4c290939ec354eb559bf"
                        target="_blank"
                      >
                        Added Link to view Transaction on EtherScan
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/commit/cbbed40291f9a8b46c8bf274ac37168f65c48622"
                        target="_blank"
                      >
                        Built Results Page for RetroPGF
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/pull/93"
                        target="_blank"
                      >
                        Needs My Vote Feature
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        href="https://github.com/voteagora/agora-next/pull/109"
                        target="_blank"
                      >
                        Implement Multi-DOA Database Architecture with Dedicated
                        Namespaces V1.1
                      </a>
                    </p>
                  </li>
                </ul>
                <br />
                <h4>Minor updates</h4>
                <ul>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/f725d71d14ee1aad9520be9943aeaa9a2ffe0d56"
                      >
                        Improved Sub-delegation Display to 2 Decimals
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/f2067b85dd4802e6ef9d05501ca79677d4353775"
                      >
                        Handle Proposal Option with No Transaction
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/e56ae1dbf112052b40ed378930203c92c6aae874"
                      >
                        Changed Design for Direct Delegation
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/58"
                      >
                        Proposals Display their Type
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/52"
                      >
                        Updated Rounding issues in Advanced Delegation
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/61"
                      >
                        Added You Badge next to your Vote
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/70"
                      >
                        Added Styling to Votes
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/80"
                      >
                        Improved Proposal Copy
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/71"
                      >
                        Improved Voting Flow UI
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/74"
                      >
                        Improved Wallet Display
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/100"
                      >
                        Add your Vote goes on the top of proposal vote list
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/127"
                      >
                        Harden Partial Delegation
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/123"
                      >
                        Dynamic Image Graphic to preview images
                      </a>
                    </p>
                  </li>
                </ul>
                <br />
                <h4>Bug fixes</h4>
                <ul>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/04e8a6fee9660883f954d278e02bc35e7c795800"
                      >
                        OP Proposal Page Bug
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/62395e473263890bd5c6d2f449b46f25accfa27a"
                      >
                        Small Standard Vote Bug
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/776190bfcd5b716e00144ef9cce232459e55d223"
                      >
                        Fixed Link to View My Profile Button
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/64"
                      >
                        Fixed Non-reactive Clicking Issue on Lower part of
                        Delegate Card
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/73"
                      >
                        Fixed Wallet Images when switching Wallets
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/88"
                      >
                        Fixed Tablet Responsiveness
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/101"
                      >
                        Fixed Infinite Loading After Voting
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/commit/d7d9d7fdbf4c9d663f0a639469467fa9722b6641"
                      >
                        Do not Allow Lookup for Invalid ETH Address
                      </a>
                    </p>
                  </li>
                  <li>
                    <p>
                      <a
                        target="_blank"
                        href="https://github.com/voteagora/agora-next/pull/102"
                      >
                        Cache Reset on Client for Proposals
                      </a>
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <div className="my-8 border-t border-gray-300"></div>
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
