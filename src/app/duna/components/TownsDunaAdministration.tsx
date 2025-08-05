"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Tenant from "@/lib/tenant/tenant";

// Document data for Towns Administration
const DUNA_DOCUMENTS = [
  {
    id: 1,
    name: "Towns Lodge - Purpose",
    url: "/documents/towns/Towns Lodge - Purpose.pdf",
    createdAt: "2025-01-01T00:00:00Z",
    uploadedBy: "Towns Governance Team",
  },
  {
    id: 2,
    name: "Towns Lodge - Association Agreement",
    url: "/documents/towns/Towns Lodge - Association Agreement.pdf",
    createdAt: "2025-01-01T00:00:00Z",
    uploadedBy: "Towns Governance Team",
  },
  {
    id: 3,
    name: "Towns Lodge - Redacted EIN",
    url: "/documents/towns/Towns Lodge - Redacted EIN.pdf",
    createdAt: "2025-01-01T00:00:00Z",
    uploadedBy: "Towns Governance Team",
  },
];

const TownsDunaAdministration = () => {
  const { ui } = Tenant.current();

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {DUNA_DOCUMENTS.map((document: any) => (
                <div
                  key={document.id}
                  className="flex items-center space-x-2 p-2 border border-line rounded-md hover:bg-neutral/50 transition-colors cursor-pointer"
                  onClick={() => window.open(document.url, "_blank")}
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

      {/* Community Dialogue Section */}
      <Card className="border border-line shadow-sm bg-[#1E1A2F] mt-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <h4 className="text-lg font-bold text-primary opacity-75">
              Community Dialogue
            </h4>
          </div>
          <div className="text-secondary text-sm opacity-75">
            Coming Soon: this section will be available on August 15, 2025.
          </div>
        </CardContent>
      </Card>

      {/* TOWNS DUNA DISCLOSURES Section */}
      <div id="duna-administration" className="mt-6">
        <div className="text-[#87819F] text-[14px] font-medium leading-[19px] mb-4">
          TOWNS LODGE – DUNA DISCLOSURES
        </div>

        <div className="space-y-6 text-justify">
          <div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              By owning the token and participating in the governance of Towns
              Lodge on this forum, you acknowledge and agree that you are
              electing to become a member of a Wyoming Decentralized
              Unincorporated Nonprofit Association (&ldquo;Association&rdquo;).
              Your participation is subject to the terms and conditions set
              forth in the Association Agreement. You further acknowledge and
              agree that any dispute, claim, or controversy arising out of or
              relating to the Association Agreement, any governance proposal, or
              the rights and obligations of members or administrators shall be
              submitted exclusively to the Wyoming Chancery Court. In the event
              that the Wyoming Chancery Court declines to exercise jurisdiction
              over any such dispute, the parties agree that such dispute shall
              be resolved exclusively in the District Court of Laramie County,
              Wyoming, or in the United States District Court for the District
              of Wyoming, as appropriate.
            </div>
          </div>

          <div>
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
              By becoming a member, you further agree that any dispute, claim,
              or proceeding arising out of or relating to the Association
              Agreement shall be resolved solely on an individual basis. You
              expressly waive any right to participate as a plaintiff or class
              member in any purported class, collective, consolidated, or
              representative action, whether in arbitration or in court. No
              class, collective, consolidated, or representative actions or
              arbitrations shall be permitted, and you expressly waive any right
              to participate in or recover relief under any such action or
              proceeding.
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-12 pt-6 border-t border-line">
        <p className="text-secondary text-sm opacity-75">
          * DUNA Administration Docs will archive upon the release of Q3
          financial statements and tax update.
        </p>
      </div>
    </div>
  );
};

export default TownsDunaAdministration;
