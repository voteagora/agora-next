import React from "react";

import Tenant from "@/lib/tenant/tenant";
import TownsDunaAdministrationArchive from "../duna/components/TownsDunaAdministrationArchive";
import DunaAdministrationArchive from "../duna/components/DunaAdministrationArchive";

export const dynamic = "force-dynamic";

export async function generateMetadata({}) {
  const tenant = Tenant.current();
  const page = tenant.ui.page("info") || tenant.ui.page("/");

  const { title, description } = page!.meta;

  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
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
      {hasDunaAdministration &&
      ui.toggle("towns-duna-administration")?.enabled ? (
        <TownsDunaAdministrationArchive />
      ) : (
        hasDunaAdministration && <DunaAdministrationArchive />
      )}
    </div>
  );
}
