import React from "react";
import Tenant from "@/lib/tenant/tenant";
import CivicPrivacyPolicy from "@/app/info/components/CivicPrivacyPolicy";
import { getMetadataBaseUrl } from "@/app/lib/utils/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const metadataBase = await getMetadataBaseUrl();
  const title = "Privacy Policy";
  const description =
    "Center for Civilians in Conflict Privacy Policy and data practices.";

  return {
    metadataBase,
    title,
    description,
  };
}

export default function Page() {
  const { ui } = Tenant.current();

  if (!ui.toggle("civic")?.enabled) {
    return (
      <div className="text-primary">Route not supported for namespace</div>
    );
  }

  return <CivicPrivacyPolicy />;
}
