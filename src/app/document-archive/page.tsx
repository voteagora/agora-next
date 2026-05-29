import React from "react";

import Tenant from "@/lib/tenant/tenant";
import DunaAdministrationArchive from "../duna/components/DunaAdministrationArchive";
import { InfoHero } from "../info/components/InfoHero";
import DunaDisclosuresContent from "../duna/components/DunaDisclosuresContent";
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
      {hasDunaAdministration && <DunaAdministrationArchive />}
      {hasDunaAdministration && ui.toggle("duna-disclosures")?.enabled && (
        <DunaDisclosuresContent />
      )}
    </div>
  );
}
