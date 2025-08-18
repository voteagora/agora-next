import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import QuarterlyReportsSection from "./QuarterlyReportsSection";
import DocumentsSection from "./DocumentsSection";
import {
  getForumTopics,
  getForumAttachments,
  getDunaCategoryId,
} from "@/lib/actions/forum";
import { transformForumTopics, ForumTopic } from "@/lib/forumUtils";

const TownsDunaAdministration = async () => {
  let dunaReports: ForumTopic[] = [];
  let documents: any[] = [];

  try {
    const dunaCategoryId = await getDunaCategoryId();
    if (!dunaCategoryId) {
      console.error("Could not find DUNA category ID");
      return (
        <div className="mt-12">
          <div className="text-center py-8 text-red-500">
            Error: Could not find DUNA category
          </div>
        </div>
      );
    }

    const [topicsResult, documentsResult] = await Promise.all([
      getForumTopics(dunaCategoryId),
      getForumAttachments(),
    ]);

    if (topicsResult.success) {
      dunaReports = transformForumTopics(topicsResult.data, {
        mergePostAttachments: true,
      });
    }

    if (documentsResult.success) {
      documents = documentsResult.data;
    }
  } catch (error) {
    console.error("Error fetching forum data:", error);
  }

  return (
    <div className="mt-12 towns-tenant">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black text-primary">
          DUNA Administration
        </h3>
      </div>

      {/* Documents Section - EXACT same as Uniswap */}
      <Card className="border border-line shadow-sm bg-modalBackgroundDark [&_button]:!bg-white [&_button]:!text-black [&_button]:!border-gray-300 [&_button]:hover:!bg-gray-50">
        <CardContent className="p-6">
          <DocumentsSection initialDocuments={documents} hideHeader={false} />
        </CardContent>
      </Card>

      {/* Community Dialogue Section - EXACT same as Uniswap */}
      <Card className="border border-line shadow-sm bg-modalBackgroundDark mt-6 [&_button]:!bg-white [&_button]:!text-black [&_button]:!border-gray-300 [&_button]:hover:!bg-gray-50">
        <CardContent className="p-6">
          <QuarterlyReportsSection
            initialReports={dunaReports}
            hideHeader={false}
          />
        </CardContent>
      </Card>

      {/* Community Dialogue Section - EXACT same as Uniswap */}
      <Card className="border border-line shadow-sm bg-[#1E1A2F] mt-6 [&_button]:!bg-white [&_button]:!text-black [&_button]:!border-gray-300 [&_button]:hover:!bg-gray-50">
        <CardContent className="p-6">
          <QuarterlyReportsSection initialReports={topics} hideHeader={false} />
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
