import React from "react";

import Tenant from "@/lib/tenant/tenant";
import TownsDunaAdministrationArchive from "../duna/components/TownsDunaAdministrationArchive";
import DunaAdministrationArchive from "../duna/components/DunaAdministrationArchive";
import { InfoHero } from "../info/components/InfoHero";
import SyndicateDunaDisclosures from "../duna/components/SyndicateDunaDisclosures";
import DunaDisclosures from "../duna/components/DunaDisclosures";
import { getMetadataBaseUrl } from "@/app/lib/utils/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({}) {
  const tenant = Tenant.current();
  const page = tenant.ui.page("info") || tenant.ui.page("/");

  const { title, description } = page!.meta;
  const metadataBase = getMetadataBaseUrl();

  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

  return {
    metadataBase,
    title: title,
    description: description,
    openGraph: {
      type: "website",
      title: title,
      description: description,
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page() {
  const { ui } = Tenant.current();

  if (!ui.toggle("info")?.enabled) {
    return (
      <div className="text-primary">Route not supported for namespace</div>
    );
  }

  const hasDunaAdministration = ui.toggle("duna")?.enabled === true;

  return (
    <div className="flex flex-col">
      <InfoHero />
      {hasDunaAdministration &&
      ui.toggle("towns-duna-administration")?.enabled ? (
        <TownsDunaAdministrationArchive />
      ) : (
        hasDunaAdministration && <DunaAdministrationArchive />
      )}
      {hasDunaAdministration ? (
        ui.toggle("towns-duna-administration")?.enabled ? null : ui.toggle(
            "syndicate-duna-disclosures"
          )?.enabled ? (
          <SyndicateDunaDisclosures />
        ) : (
          <DunaDisclosures />
        )
      ) : null}

      {ui.toggle("towns-duna-administration")?.enabled ? (
        <>
          {/* TOWNS DUNA DISCLOSURES Section */}
          <div id="duna-administration" className="mt-6">
            <div className="text-[#87819F] text-[14px] font-medium leading-[19px] mb-4">
              TOWNS LODGE – DUNA DISCLOSURES
            </div>

            <div className="space-y-6 text-justify">
              <div>
                <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
                  By owning the token and participating in the governance of
                  Towns Lodge, you acknowledge and agree that you are electing
                  to become a member of a Wyoming Decentralized Unincorporated
                  Nonprofit Association (&ldquo;Association&rdquo;). Your
                  participation is subject to the terms and conditions set forth
                  in the Association Agreement. You further acknowledge and
                  agree that any dispute, claim, or controversy arising out of
                  or relating to the Association Agreement, any governance
                  proposal, or the rights and obligations of members or
                  administrators shall be submitted exclusively to the Wyoming
                  Chancery Court. In the event that the Wyoming Chancery Court
                  declines to exercise jurisdiction over any such dispute, the
                  parties agree that such dispute shall be resolved exclusively
                  in the District Court of Laramie County, Wyoming, or in the
                  United States District Court for the District of Wyoming, as
                  appropriate.
                </div>
              </div>

              <div>
                <div className="text-[#87819F] text-[14px] font-medium leading-[19px]">
                  By becoming a member, you further agree that any dispute,
                  claim, or proceeding arising out of or relating to the
                  Association Agreement shall be resolved solely on an
                  individual basis. You expressly waive any right to participate
                  as a plaintiff or class member in any purported class,
                  collective, consolidated, or representative action, whether in
                  arbitration or in court. No class, collective, consolidated,
                  or representative actions or arbitrations shall be permitted,
                  and you expressly waive any right to participate in or recover
                  relief under any such action or proceeding.
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-12 pt-6 border-t border-line">
            <p className="text-secondary text-sm opacity-75">
              * DUNA Administration Docs will archive upon the release of the
              year-end financial statements and tax update.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
