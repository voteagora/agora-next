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
          What if a truly decentralized network launched today, with no
          committees or inherited playbook? Propose a governance model that can
          hold up over time. The winning design earns $15K USD.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">Why this prompt</h2>
        <Card className="border-line bg-wash border-l-4 border-l-primary">
          <CardContent className="pt-6 space-y-4">
            <p className="text-secondary leading-relaxed">
              Most governance conversations begin with inherited institutions,
              power centers, and political baggage. This contest intentionally
              starts earlier: design governance as if the network begins now and
              legitimacy has to be earned, not assumed.
            </p>
            <p className="text-secondary leading-relaxed">
              The goal is not to mirror a specific chain. The goal is to define
              durable rules for upgrades, participation, accountability, and
              conflict resolution that can survive real stress over time.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">
          Constraints your design should respect
        </h2>
        <p className="text-secondary mb-4">
          Use the following baseline assumptions. Your submission should engage
          with each area:
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-line border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Accounts &amp; sybils</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Identity and sybil resistance are wired into how accounts work.
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
                Token issuance follows a curve that tapers steeply early, then
                settles to a steady long-term rate.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Treasury &amp; burns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Protocol revenue feeds a treasury; the north-star use is
                supporting buy-and-burn of the native asset (your governance
                should say how that stays credible).
              </p>
            </CardContent>
          </Card>

          <Card className="border-line border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Launch &amp; constitution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                There is room for early funding and tooling, but the ambition is
                a clean launch: codified rules and a constitution-like layer
                that outlasts any single team.
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
                not ad hoc multisigs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Broad participation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                The economics include a UBI-like tilt: ordinary use of the
                protocol should benefit participants, not only large holders.
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
              <CardTitle className="text-lg">What to deliver</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-secondary leading-relaxed">
                  Written plan with diagrams, flows, specs, or contract
                  sketches.
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
                What judges will look for
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
                    incentives and process that still make sense years out, not
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
                  We qualify work that matches the contest brief in spirit, is
                  substantive, and does not cause clear harm. Borderline cases
                  are judgment calls by Agora.
                </p>
              </CardContent>
            </Card>

            <Card className="border-line bg-tertiary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Eligibility</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary leading-relaxed">
                  Individuals only — no teams or orgs as named entrants.
                </p>
              </CardContent>
            </Card>

            <Card className="border-line bg-tertiary/5 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Agora team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary leading-relaxed">
                  Agora people may comment or participate in the open, but they
                  do not receive voting power in this contest.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-xs text-tertiary uppercase tracking-wide">
            Enforcement & payout
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-line bg-tertiary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Prize &amp; KYC</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary leading-relaxed">
                  The prize is paid in USD after a private KYC step with Agora
                  for the winning individual.
                </p>
              </CardContent>
            </Card>

            <Card className="border-line bg-tertiary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-secondary leading-relaxed">
                  We may remove or disqualify spam, fraud, or bad-faith entries.
                  Notable rejections are documented in the submissions repo;
                  contested cases can be reopened through the repo&apos;s usual
                  review process (including supermajority support from past
                  submitters where applicable — see repo README for the exact
                  bar).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">Why bother</h2>
        <Card className="border-line bg-wash border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <p className="text-secondary leading-relaxed">
              Most of us have a list of things we wish on-chain governance did
              differently. This is a rare moment to sketch that from scratch on
              a chain that has not yet ossified — and to stress-test those ideas
              against a community that will push back hard.
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
                Create an entry here. Add contact info and GitHub if you want
                reviewers to reach you.
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
                Use the forums for conversation; submissions are also mirrored
                to GitHub for line-by-line review and follow-up PRs.
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
                Timing and mechanics are announced on{" "}
                <a
                  href="https://twitter.com/AgoraGovernance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brandPrimary hover:underline"
                >
                  @AgoraGovernance
                </a>
                . Ballots run on-chain in this app.
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
