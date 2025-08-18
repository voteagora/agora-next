"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Tenant from "@/lib/tenant/tenant";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

// Static data for Towns Administration
const STATIC_2025_DUNA_DOCUMENTS = [
  {
    id: 1,
    title: "Q3 2025 Financial Statements and Estimated Tax Payments",
    description: "Placeholder text describing the purpose of this document",
    author: "Towns Governance Team",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    createdAt: "2025-09-30T00:00:00Z",
    comments: [],
    attachments: [],
  },
];

const STATIC_OTHER_DOCUMENTS = [
  {
    id: 1,
    name: "Towns DUNA formation proposal",
    url: "#",
    ipfsCid: "QmExample1",
    createdAt: "2024-12-01T00:00:00Z",
    uploadedBy: "Towns Governance Team",
  },
  {
    id: 2,
    name: "Towns DUNA EIN letter (redacted)",
    url: "#",
    ipfsCid: "QmExample2",
    createdAt: "2024-11-15T00:00:00Z",
    uploadedBy: "Towns Governance Team",
  },
  {
    id: 3,
    name: "Towns DUNA 8832 letter (redacted)",
    url: "#",
    ipfsCid: "QmExample3",
    createdAt: "2024-10-20T00:00:00Z",
    uploadedBy: "Towns Governance Team",
  },
  {
    id: 4,
    name: "Notice of registered agent for service of process",
    url: "#",
    ipfsCid: "QmExample4",
    createdAt: "2024-09-15T00:00:00Z",
    uploadedBy: "Towns Governance Team",
  },
];

const TownsDunaAdministration = () => {
  const { ui } = Tenant.current();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReportClick = (report: any) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-primary">
          DUNA Administration
        </h3>
      </div>

      <Card className="border border-line shadow-sm bg-[#1E1A2F]">
        <CardContent className="p-6">
          {/* 2025 DUNA documents Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <h4 className="text-lg font-bold text-primary">
                2025 DUNA documents
              </h4>
            </div>

            <div className="space-y-4">
              {STATIC_2025_DUNA_DOCUMENTS.map((report: any) => (
                <div
                  key={report.id}
                  className="p-4 border border-line rounded-lg hover:bg-neutral/50 transition-colors cursor-pointer"
                  onClick={() => handleReportClick(report)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-tertiary/20 rounded flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-tertiary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-primary">
                        {report.title}
                      </h5>
                      <p className="text-secondary text-sm">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other documents Section */}
          <div className="mt-8 pt-6 border-t border-line">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <h4 className="text-lg font-bold text-primary">
                Other documents
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {STATIC_OTHER_DOCUMENTS.map((document: any) => (
                <div
                  key={document.id}
                  className="flex items-center space-x-2 p-2 border border-line rounded-md hover:bg-neutral/50 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 bg-tertiary/20 rounded flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-tertiary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-primary text-sm truncate">
                      {document.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TOWNS DUNA DISCLOSURES Section */}
      <div className="mt-6">
        <div className="text-[#87819F] text-[14px] font-medium leading-[19px] mb-4">
          TOWNS DUNA DISCLOSURES
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              1. Forward-Looking Statement Legend
            </div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              This document contains forward-looking statements, including
              anticipated regulatory outcomes, governance upgrades, treasury
              actions, and fee-switch economics. Actual results may differ
              materially due to legislative shifts, market volatility, community
              votes, or smart-contract failures. No duty to update these
              statements is assumed.
            </div>
          </div>

          <div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              2. Regulatory Risk Disclosure
            </div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              The U.S. Securities and Exchange Commission (&ldquo;SEC&rdquo;)
              closed its inquiry into Towns Labs in February 2025 without
              enforcement action. Future administrations or other agencies may
              reopen investigations or pursue new theories of liability
              notwithstanding this reprieve. Global regulators may not recognize
              a DUNA; activities conducted under this wrapper could still
              trigger securities-, commodities-, AML-, or tax-law obligations in
              other jurisdictions.
            </div>
          </div>

          <div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              3. Legal-Structure Caveats
            </div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              A Wyoming DUNA provides limited liability only to the extent
              Wyoming law is respected by the forum hearing a dispute. Foreign
              courts and U.S. federal agencies are not bound to honor that
              limitation. The DUNA framework is novel and untested at scale;
              material aspects may be revised by future Wyoming legislative
              sessions or challenged in court.
            </div>
          </div>

          <div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              4. Governance-Token & Fee-Switch Risks
            </div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              The UNI token does not automatically convey a right to protocol
              cash flows. Turning on the &ldquo;fee switch&rdquo; requires a
              separate on-chain vote and may expose UNI holders and the DAO to
              additional regulatory scrutiny. Token-holder incentives may
              diverge from broader ecosystem interests, leading to extractive
              proposals that erode protocol competitiveness. The DAO treasury
              (~$6 billion, majority in UNI) is highly concentrated; market
              shocks or liquidity drains could impair runway. Deploying treasury
              assets through the DUNA could generate U.S. federal, state, or
              foreign tax liabilities at the DUNA level even if no distributions
              are made to token holders.
            </div>
          </div>

          <div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              6. Technical & Operational Risks
            </div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              Smart-contract code is open-source and may contain
              vulnerabilities. Upgrades carry non-zero risk of governance
              capture or execution error. Cross-chain deployments (e.g.,
              Unichain, Base) increase surface area for bridge exploits and
              consensus failures. UNI and related derivatives are subject to
              extreme volatility, thin order books on certain pairs, and
              potential delistings on centralized venues. Liquidity provider
              (&ldquo;LP&rdquo;) incentives can change rapidly, affecting swap
              pricing and protocol volume.
            </div>
          </div>

          <div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              8. Tax & Accounting Disclaimer
            </div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              Neither the DAO nor this document provides tax advice. Token
              holders should consult qualified advisers regarding income
              recognition, cost-basis tracking, and potential self-employment or
              excise taxes arising from governance participation.
            </div>
          </div>

          <div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              9. Conflict-of-Interest Statement
            </div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              Delegates, service providers, and authors of this document may
              hold UNI or have commercial relationships with Towns Labs, the
              Towns Foundation, or third-party vendors. Positions may change
              without notice.
            </div>
          </div>

          <div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              10. No Offer or Solicitation
            </div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              Nothing herein constitutes an offer to sell, or the solicitation
              of an offer to buy, any token, security, or other financial
              instrument in any jurisdiction.
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent
          className={`max-w-3xl w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto overflow-x-hidden ${ui.customization?.customInfoSectionBackground ? `bg-[${ui.customization.customInfoSectionBackground}]` : "bg-white"}`}
        >
          <DialogHeader className="pb-4 sm:pb-6 border-b border-line">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl sm:text-2xl font-black text-primary mb-2">
                  {selectedReport?.title}
                </DialogTitle>
                <div className="text-xs sm:text-sm text-secondary">
                  Created{" "}
                  {selectedReport
                    ? format(
                        new Date(selectedReport.createdAt),
                        "MMM d, yyyy hh:mm"
                      )
                    : ""}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
            {/* Author and Content Section */}
            <div className="flex gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <span className="text-xs sm:text-sm text-secondary">
                    By {selectedReport?.author}
                  </span>
                  <span className="text-xs sm:text-sm text-secondary">
                    posted{" "}
                    {selectedReport
                      ? format(
                          new Date(selectedReport.createdAt),
                          "MMM d, yyyy hh:mm"
                        )
                      : ""}
                  </span>
                </div>

                {/* Report Content */}
                <div className="text-secondary leading-relaxed space-y-3 sm:space-y-4">
                  {selectedReport?.content
                    .split("\n\n")
                    .map((paragraph: string, index: number) => (
                      <p
                        key={index}
                        className="text-xs sm:text-sm break-words whitespace-pre-wrap leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TownsDunaAdministration;
