import React from "react";

const SyndicateDunaDisclosures = () => {
  return (
    <div id="duna-administration" className="mt-8">
      <div
        style={{
          color: "var(--stone-700, #4F4F4F)",
          fontSize: "14px",
          lineHeight: "19px",
        }}
      >
        <div className="mb-6 font-medium">
          SYNDICATE NETWORK COLLECTIVE - DUNA DISCLOSURES
        </div>

        <div className="font-medium">
          <p className="mt-2">
            By owning the token and participating in the governance of
            Syndicate, you acknowledge and agree that you are electing to become
            a member of a Wyoming Decentralized Unincorporated Nonprofit
            Association (&quot;Association&quot;). Your participation is subject
            to the terms and conditions set forth in the Association Agreement.
            You further acknowledge and agree that any dispute, claim, or
            controversy arising out of or relating to the Association Agreement,
            any governance proposal, or the rights and obligations of members or
            administrators shall be submitted exclusively to the Wyoming
            Chancery Court. In the event that the Wyoming Chancery Court
            declines to exercise jurisdiction over any such dispute, the parties
            agree that such dispute shall be resolved exclusively in the
            District Court of Laramie County, Wyoming, or in the United States
            District Court for the District of Wyoming, as appropriate.
          </p>
          <p className="mt-4">
            By becoming a member, you further agree that any dispute, claim, or
            proceeding arising out of or relating to the Association Agreement
            shall be resolved solely on an individual basis. You expressly waive
            any right to participate as a plaintiff or class member in any
            purported class, collective, consolidated, or representative action,
            whether in arbitration or in court. No class, collective,
            consolidated, or representative actions or arbitrations shall be
            permitted, and you expressly waive any right to participate in or
            recover relief under any such action or proceeding.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-12 pt-6 border-t border-line">
        <p className="text-secondary text-sm opacity-75">
          * DUNA Administration Docs will archive upon the release of the
          year-end financial statements and tax0020update.
        </p>
      </div>
    </div>
  );
};

export default SyndicateDunaDisclosures;
