import React from "react";

const DunaDisclosures = () => {
  return (
    <div className="mt-8">
      <div className="w-full h-[1px] bg-gray-300 mb-6"></div>
      <div
        style={{
          color: "var(--stone-700, #4F4F4F)",
          fontSize: "14px",
          lineHeight: "19px",
        }}
      >
        <div className="mb-6">DUNI Disclosures</div>

        <div>
          <div>
            <p className="mt-2">
              By owning the token and engaging in the Uniswap Governance
              Protocol, you acknowledge and agree that you are electing to
              become a member of a Wyoming Decentralized Unincorporated
              Nonprofit Association (&quot;Association&quot;). Your
              participation is subject to the terms and conditions set forth in
              the Association Agreement. You further acknowledge and agree that
              any dispute, claim, or controversy arising out of or relating to
              the Association Agreement, any governance proposal, or the rights
              and obligations of members or administrators shall be submitted
              exclusively to the Wyoming Chancery Court. In the event that the
              Wyoming Chancery Court declines to exercise jurisdiction over any
              such dispute, the parties agree that such dispute shall be
              resolved exclusively in the District Court of Laramie County,
              Wyoming, or in the United States District Court for the District
              of Wyoming, as appropriate.
            </p>

            <p className="mt-2">
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
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DunaDisclosures;
