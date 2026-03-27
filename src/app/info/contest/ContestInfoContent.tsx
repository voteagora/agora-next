"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function ContestInfoContent() {
  return (
    <div className="flex flex-col gap-12 max-w-4xl mx-auto py-12 px-4">
      <section className="text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary">
          The Agora Novo Origo Prize
        </h1>
        <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
          What if a truly decentralized blockchain launched today, without pre-existing
          core contributors, committees, token holders, or investors? Propose a governance model 
          that can hold up over time.
          </p>
        <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
          The winning design earns $15K USD.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">Why?</h2>
        <Card className="border-line bg-wash border-l-4 border-l-primary">
          <CardContent className="pt-6 space-y-4">
            <p className="text-secondary leading-relaxed">
              Most governance conversations begin with inherited institutions, 
              power centers, political baggage and even cap tables. This contest 
              intentionally starts earlier: design governance as if the protocol begins 
              now and legitimacy has to be earned, not assumed.
            </p>
            <p className="text-secondary leading-relaxed">
              The goal is to define a durable and competitve governance system for change across 
              unknowable unknowns, evolving narratives, and necessary upgrades.  This is about 
              either removing the humans or ensuring rational behaviour if they are necessary.  
              This is about aligning incentives, iteration off of what has been done before.  
              
              Does a system exist to manage conflict resolution and survive real stress over time?  
              What new primitives would be necessary to function?  Where are the limits and risks, if any?
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">
          Constraints your design should respect
        </h2>
        <p className="text-secondary mb-4">
          Use the following properties about the protocol at launch. Assume they work.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-line border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Approximate Sybil Resistance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Sybil resistance is wired into how accounts work.
                Treat it as strong but imperfect: design for real-world abuse,
                not a perfect game.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Issuance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                The native asset issuance follows a curve that tapers slowly over time, then
                settles to long-term rate of issuance.  There is no premine.  No "early" investors.
                Should convernance control this rate? You decide.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Managed Burn</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Protocol revenue feeds a simple treasury mechanism; the north-star 
                use is supporting buy-and-burn of the native asset.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Launch &amp; Funding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                The chain has a benevolent founder donating altruistically to bootstrap the chain's launch.  
                However, after launch funding is extinguished, the chain must sustain itself.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upgrades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Core protocol changes are expected to route through governance,
                not blessed or ceremony-created multisigs. 
              </p>
            </CardContent>
          </Card>

          <Card className="border-line border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Broad Participation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                The economics include a UBI-like tilt: ordinary use of the
                protocol should will participants.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line md:col-span-2 border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Validators</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Validators are economic actors with incentives aligned to
                keeping the network running; governance should mesh with that
                reality.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-line bg-tertiary/5 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">What to Deliver</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-secondary leading-relaxed">
                  Written declaration of governance design in the minimum.  Submissions may optionally be augmented with mixed-media.  Internet native techniques are encouraged.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-secondary leading-relaxed">
                  Clear tradeoffs: failure cases, who loses, and what you will
                  monitor post-launch.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-secondary leading-relaxed">
                  Public critique on other submissions to strengthen the field.
                </p>
              </div>
              <p className="pt-1 text-sm text-primary font-medium leading-relaxed">
                $15K to the winning entry.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line bg-tertiary/5 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">
                How to Judge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3 rounded-md border border-line bg-tertiary/5 p-4">
                  <span className="text-xs font-bold text-tertiary">01</span>
                  <p className="text-sm text-secondary leading-relaxed">
                    <span className="font-semibold text-primary">
                      Upgrades:
                    </span>{" "}
                    a credible path for protocol change that does not fall apart
                    under stress.
                  </p>
                </div>
                <div className="flex gap-3 rounded-md border border-line bg-tertiary/5 p-4">
                  <span className="text-xs font-bold text-tertiary">02</span>
                  <p className="text-sm text-secondary leading-relaxed">
                    <span className="font-semibold text-primary">
                      Learning from history:
                    </span>{" "}
                    explicit guardrails against plutocracy, expert capture, and
                    other well-known DAO failure modes.
                  </p>
                </div>
                <div className="flex gap-3 rounded-md border border-line bg-tertiary/5 p-4">
                  <span className="text-xs font-bold text-tertiary">03</span>
                  <p className="text-sm text-secondary leading-relaxed">
                    <span className="font-semibold text-primary">
                      On-chain vs social:
                    </span>{" "}
                    where rules live on-chain, where humans must interpret, and
                    how you avoid locking out non-technical stakeholders.
                  </p>
                </div>
                <div className="flex gap-3 rounded-md border border-line bg-tertiary/5 p-4">
                  <span className="text-xs font-bold text-tertiary">04</span>
                  <p className="text-sm text-secondary leading-relaxed">
                    <span className="font-semibold text-primary">
                      Longevity:
                    </span>{" "}
                    incentives and process that still make sense decades out, not
                    only at genesis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">Rules</h2>

        <div className="space-y-2">
          <p className="text-xs text-tertiary uppercase tracking-wide">
            Governance
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-line bg-tertiary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Winner</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary leading-relaxed">
                  Selected by a vote among people whose submissions are accepted
                  into the qualified set.
                </p>
              </CardContent>
            </Card>

            <Card className="border-line bg-tertiary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Voting weight</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-secondary">
                    Qualified, identified
                  </p>
                  <p className="text-sm font-semibold text-primary">1</p>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm text-secondary">Qualified, anonymous</p>
                  <p className="text-sm font-semibold text-primary">0</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-xs text-tertiary uppercase tracking-wide">
            Eligibility
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-line bg-tertiary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  Qualifying submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary leading-relaxed">
                  We qualify submissions that matche the contest brief in spirit,
                  is substantive, and does not cause clear harm to the community 
                  or contest. 
                </p>
              </CardContent>
            </Card>

            <Card className="border-line bg-tertiary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Eligibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary leading-relaxed">
                  Individuals only — no teams or orgs as named entrants.  One entry per person.
                </p>
              </CardContent>
            </Card>

            <Card className="border-line bg-tertiary/5 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Agora Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary leading-relaxed">
                  Agora staff may participate as individuals, however must self-identify. 
                  However do not receive voting power for submissions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-xs text-tertiary uppercase tracking-wide">
            Enforcement & Payout
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-line bg-tertiary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Prize &amp; KYC</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary leading-relaxed">
                  The prize is paid in USDT or USDC on Ethereum or Optimism after a 
                  private KYC step with Agora for the winning individual.
                </p>
              </CardContent>
            </Card>

            <Card className="border-line bg-tertiary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary leading-relaxed">
                  Submissions may be removed and disqualified for spam, fraud, 
                  or bad-faith.
                  Notable rejections are documented in the submissions repo;
                  contested cases can be reopened through the repo&apos;s usual
                  review process (including supermajority support from past
                  submitters where applicable — see repo README for the exact 
                  details).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">Why Bother?</h2>
        <Card className="border-line bg-wash border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <p className="text-secondary leading-relaxed">
              Most of us have a list of things we wish on-chain governance did
              differently. This is a rare moment to flex and sketch that before ossification. 
              And, to stress-test those ideas against a community that will push back hard.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">How to participate</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-line">
            <CardHeader>
              <CardTitle className="text-lg">Submit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary mb-4">
                Create an entry on the submission page. Then, either check the 
                proposal page every few days or follow @AgoraGovernance for updates. 
              </p>
              <a
                href="/submissions/new"
                className="text-sm font-medium text-brandPrimary hover:underline"
              >
                New submission →
              </a>
            </CardContent>
          </Card>

          <Card className="border-line">
            <CardHeader>
              <CardTitle className="text-lg">Discuss</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary mb-4">
                Use the forums to question and critique.  Feedback is a gift. 
                
                All submissions are also mirrored to a GitHub repo.  Once merge,
                submissions are added to the qualified set.
              </p>
              <a
                href="https://github.com/voteagora/novo-origo-contest-submissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-brandPrimary hover:underline"
              >
                GitHub mirror →
              </a>
            </CardContent>
          </Card>

          <Card className="border-line">
            <CardHeader>
              <CardTitle className="text-lg">Vote</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary mb-4">
                Timing details were shared in the blog post here: TODO .  Check {" "}
                <a
                  href="https://twitter.com/AgoraGovernance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brandPrimary hover:underline"
                >
                  @AgoraGovernance
                </a>
                for updates. Ballots run on-chain in this app.
              </p>
              <a
                href="/proposals"
                className="text-sm font-medium text-brandPrimary hover:underline"
              >
                Proposals / voting →
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="text-center pt-8 border-t border-line">
        <p className="text-sm text-tertiary">
          Questions? File an issue on{" "}
          <a
            href="https://github.com/voteagora/novo-origo-contest-submissions/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-secondary"
          >
            GitHub
          </a>{" "}
          or find us on{" "}
          <a
            href="https://discord.gg/agora"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-secondary"
          >
            Discord
          </a>
          .
        </p>
      </section>
    </div>
  );
}
