import React from "react";

const SyndicateDunaDisclosures = () => {
  return (
    <div className="mt-8">
      <div className="w-full h-[1px] bg-gray-300 mb-6" />
      <div
        style={{
          color: "var(--stone-700, #4F4F4F)",
          fontSize: "14px",
          lineHeight: "19px",
        }}
      >
        <div className="mb-6 font-medium">SYNDICATE DUNA DISCLOSURES</div>

        <div className="font-medium">
          <div>
            <span>1. Forward-Looking Statement Legend</span>
            <p className="mt-2">
              This document contains forward-looking statements, including
              anticipated regulatory outcomes, governance upgrades, treasury
              actions, and fee-switch economics. Actual results may differ
              materially due to legislative shifts, market volatility, community
              votes, or smart-contract failures. No duty to update these
              statements is assumed.
            </p>
          </div>

          <div className="mt-6">
            <span>2. Regulatory Risk Disclosure</span>
            <p className="mt-2">
              The U.S. Securities and Exchange Commission (&quot;SEC&quot;) closed its
              inquiry into Syndicate Labs in February 2025 without enforcement
              action. Future administrations or other agencies may reopen
              investigations or pursue new theories of liability notwithstanding
              this reprieve. Global regulators may not recognize a DUNA;
              activities conducted under this wrapper could still trigger
              securities-, commodities-, AML-, or tax-law obligations in other
              jurisdictions.
            </p>
          </div>

          <div className="mt-6">
            <span>3. Legal-Structure Caveats</span>
            <p className="mt-2">
              A Wyoming DUNA provides limited liability only to the extent
              Wyoming law is respected by the forum hearing a dispute. Foreign
              courts and U.S. federal agencies are not bound to honor that
              limitation. The DUNA framework is novel and untested at scale;
              material aspects may be revised by future Wyoming legislative
              sessions or challenged in court.
            </p>
          </div>

          <div className="mt-6">
            <span>4. Governance-Token &amp; Fee-Switch Risks</span>
            <p className="mt-2">
              The UNI token does not automatically convey a right to protocol
              cash flows. Turning on the &quot;fee switch&quot; requires a
              separate on-chain vote and may expose UNI holders and the DAO to
              additional regulatory scrutiny. Token-holder incentives may
              diverge from broader ecosystem interests, leading to extractive
              proposals that erode protocol competitiveness. The DAO treasury
              (~$6 billion, majority in UNI) is highly concentrated; market
              shocks or liquidity drains could impair runway. Deploying treasury
              assets through the DUNA could generate U.S. federal, state, or
              foreign tax liabilities at the DUNA level even if no distributions
              are made to token holders.
            </p>
          </div>

          <div className="mt-6">
            <span>6. Technical &amp; Operational Risks</span>
            <p className="mt-2">
              Smart-contract code is open-source and may contain
              vulnerabilities. Upgrades carry non-zero risk of governance
              capture or execution error. Cross-chain deployments (e.g.,
              Unichain, Base) increase surface area for bridge exploits and
              consensus failures. UNI and related derivatives are subject to
              extreme volatility, thin order books on certain pairs, and
              potential delistings on centralized venues. Liquidity provider
              (&quot;LP&quot;) incentives can change rapidly, affecting swap
              pricing and protocol volume.
            </p>
          </div>

          <div className="mt-6">
            <span>8. Tax & Accounting Disclaimer</span>
            <p className="mt-2">
              Neither the DAO nor this document provides tax advice. Token
              holders should consult qualified advisers regarding income
              recognition, cost-basis tracking, and potential self-employment or
              excise taxes arising from governance participation.
            </p>
          </div>

          <div className="mt-6">
            <span>9. Conflict-of-Interest Statement</span>
            <p className="mt-2">
              Delegates, service providers, and authors of this document may
              hold UNI or have commercial relationships with Syndicate Labs, the
              Syndicate Foundation, or third-party vendors. Positions may change
              without notice.
            </p>
          </div>

          <div className="mt-6">
            <span>10. No Offer or Solicitation</span>
            <p className="mt-2">
              Nothing herein constitutes an offer to sell, or the solicitation
              of an offer to buy, any token, security, or other financial
              instrument in any jurisdiction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyndicateDunaDisclosures;
