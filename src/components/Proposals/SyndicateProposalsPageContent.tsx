"use client";

export default function SyndicateProposalsPageContent() {
  return (
    <div className="flex flex-col space-y-3 mb-6 bg-neutral border border-line shadow-newDefault rounded-xl p-6">
      <h2 className="text-lg font-bold text-primary">Voting process:</h2>
      <ul className="list-disc list-outside space-y-2 text-secondary text-sm leading-relaxed ml-6">
        <li>
          In order for a <strong>Governance Proposal</strong> to be enacted, it
          must:
          <ul className="list-[circle] list-outside space-y-2 ml-6 mt-2 text-sm leading-relaxed">
            <li>
              first be submitted as a <strong>Temp-Check</strong>, which is a
              seven-day period during which <strong>Members</strong> can utilize
              their SYND token to indicate support for a proposal. In order for
              a proposal to transition from a <strong>Temp-Check</strong> to a
              vote of the membership, the <strong>Temp-Check</strong> must
              attain the support of 5% of the SYND tokens in circulation, except
              as limited by Article 13 of the Association Agreement.
            </li>
            <li>
              upon a successful <strong>Temp-Check</strong>, the{" "}
              <strong>Governance Proposal</strong> period is open for seven
              days, during which time
              <strong> Members</strong> can utilize their SYND token to affirm,
              deny, or participate without voting on the proposal. A proposal:
              <ul className="list-[square] list-outside space-y-1 ml-6 mt-2 text-sm leading-relaxed">
                <li>
                  <strong>passes</strong> if the majority of votes affirm the
                  proposal and 10% of the SYND tokens in circulation participate
                  in the vote; and
                </li>
                <li>
                  <strong>fails</strong> if the majority of votes deny the
                  proposal or 10% of the SYND tokens in circulation did not
                  participate in the vote.
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          A passed <strong>Governance Proposal</strong> can be reverted for
          further consideration and modification pursuant to Article 14 of the
          Association Agreement if it is determined by the{" "}
          <strong>Rules Committee</strong> within 3-days of passage to be
          violative of legal requirements, technically unfeasible, or malicious.
          If the 3-day period expires without reversion or the{" "}
          <strong>Rules Committee</strong> affirms the{" "}
          <strong>Governance Proposal</strong>, it is enacted.
        </li>
        <li>
          Upon enactment of a <strong>Governance Proposal</strong>, any
          recipients of funds must complete a tax reporting intake through
          tooling provided by the
          <strong> Rules Committee Administrator</strong> within 15 days, or the
          payment will expire, and the recipient shall not be eligible to
          receive the funds absent future <strong>Governance Proposal</strong>.
        </li>
      </ul>
    </div>
  );
}
