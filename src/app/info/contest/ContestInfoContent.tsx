"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ContestInfoContent() {
  return (
    <div className="flex flex-col gap-12 max-w-4xl mx-auto py-12 px-4">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <Badge variant="outline" className="text-sm px-4 py-1">
          $15,000 Prize
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary">
          The Agora Novo Origo Prize
        </h1>
        <p className="text-xl text-secondary max-w-2xl mx-auto">
          Design the governance system for a new L1 blockchain. The best
          submission wins $15,000.
        </p>
      </section>

      {/* Imagine Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">
          Imagine a New L1 Chain
        </h2>
        <p className="text-secondary leading-relaxed">
          We've partnered with an ambitious L1 project that's building from
          scratch. Governance is a blank canvas—no legacy systems, no technical
          debt, no sacred cows. This is your chance to design something new.
        </p>
      </section>

      {/* Chain Properties */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">
          The Chain's Properties
        </h2>
        <p className="text-secondary mb-4">
          The chain has the following properties that your governance design
          must accommodate:
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-line">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">1. Sybil Resistance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                The chain has a built-in sybil resistance mechanism. Your
                governance design can leverage this.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">2. Emission Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                New tokens are emitted on a predictable schedule. Governance may
                control allocation.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">3. Treasury</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                A protocol treasury exists. Governance decides how funds are
                allocated.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">4. Bootstrap Funding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Initial funding is allocated for ecosystem development.
                Distribution mechanism is open.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                5. Protocol Upgrades via Governance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Protocol upgrades happen through governance. Design the process.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">6. Quasi-UBI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                The chain supports a form of universal basic income. Governance
                may influence parameters.
              </p>
            </CardContent>
          </Card>

          <Card className="border-line md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">7. Validator Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary">
                Validators can act as autonomous agents. Consider how this
                affects governance participation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* The Ask */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">The Ask</h2>
        <p className="text-secondary leading-relaxed">
          Submit a written plan and mixed-media design for the governance
          system. Your submission should include:
        </p>
        <ul className="list-disc list-inside text-secondary space-y-2 ml-4">
          <li>A comprehensive written proposal (markdown)</li>
          <li>Diagrams, flowcharts, or visual aids</li>
          <li>
            Optional: code snippets, smart contract sketches, or pseudocode
          </li>
        </ul>
      </section>

      {/* Submission Guidance */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">
          Submission & Judging Guidance
        </h2>
        <div className="space-y-3 text-secondary">
          <p>
            <strong className="text-primary">
              Must solve protocol changes:
            </strong>{" "}
            How does the chain upgrade? Who decides? What safeguards exist?
          </p>
          <p>
            <strong className="text-primary">Avoid known failure modes:</strong>{" "}
            Learn from existing DAOs. Don't repeat their mistakes.
          </p>
          <p>
            <strong className="text-primary">
              Attempt code-is-law with nuance:
            </strong>{" "}
            Pure on-chain governance has limits. How do you handle edge cases?
          </p>
          <p>
            <strong className="text-primary">Must be sustainable:</strong>{" "}
            Governance should work for years, not just launch day.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">When</h2>
        <Card className="border-line bg-wash">
          <CardContent className="pt-6">
            <ul className="space-y-3 text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-positive font-bold">Open:</span>
                <span>
                  Contest stays open until we receive 5+ qualified submissions
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-negative font-bold">Close:</span>
                <span>
                  Closes at 25 submissions OR after 4 days of inactivity (no new
                  submissions) followed by a 3-day countdown
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-primary">Voting:</span>
                <span>
                  Voting begins when the contest closes and lasts 7 days
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Rules */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">Rules</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Voting Power
            </h3>
            <ul className="list-disc list-inside text-secondary space-y-1 ml-4">
              <li>
                <strong>3 votes</strong> for identified submitters (name +
                contact info)
              </li>
              <li>
                <strong>1 vote</strong> for anonymous submitters
              </li>
              <li>
                <strong>0 votes</strong> for Agora staff (can participate but
                cannot vote)
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Eligibility
            </h3>
            <ul className="list-disc list-inside text-secondary space-y-1 ml-4">
              <li>One submission per wallet address</li>
              <li>KYC required for prize winner (for compliance)</li>
              <li>Only qualified submitters can vote</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Moderation
            </h3>
            <p className="text-secondary">
              Submissions may be disqualified for spam, plagiarism, or content
              that violates community standards. Appeals can be made via GitHub
              issues.
            </p>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">Why This Matters</h2>
        <Card className="border-line bg-wash">
          <CardContent className="pt-6">
            <p className="text-secondary leading-relaxed">
              If you've ever complained about governance—low turnout, whale
              dominance, proposal spam, voter fatigue, capture by
              insiders—here's your shot. Design something better. Prove it can
              work. Win $15,000 and potentially see your design implemented on a
              real chain.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* How To Participate */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-primary">How to Participate</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-line">
            <CardHeader>
              <CardTitle className="text-lg">Submit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary mb-4">
                Connect your wallet and submit your governance design proposal.
              </p>
              <a
                href="/submissions/new"
                className="text-sm font-medium text-brandPrimary hover:underline"
              >
                Go to Submission Form →
              </a>
            </CardContent>
          </Card>

          <Card className="border-line">
            <CardHeader>
              <CardTitle className="text-lg">Critique</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary mb-4">
                Review submissions and provide feedback via GitHub issues.
              </p>
              <a
                href="https://github.com/voteagora/novo-origo-contest-submissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-brandPrimary hover:underline"
              >
                View GitHub Repo →
              </a>
            </CardContent>
          </Card>

          <Card className="border-line">
            <CardHeader>
              <CardTitle className="text-lg">Vote</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary mb-4">
                Once qualified, use your voting power to choose the winner.
              </p>
              <a
                href="/proposals"
                className="text-sm font-medium text-brandPrimary hover:underline"
              >
                View Voting (when open) →
              </a>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer Note */}
      <section className="text-center pt-8 border-t border-line">
        <p className="text-sm text-tertiary">
          Questions? Open an issue on{" "}
          <a
            href="https://github.com/voteagora/novo-origo-contest-submissions/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-secondary"
          >
            GitHub
          </a>{" "}
          or reach out on{" "}
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
