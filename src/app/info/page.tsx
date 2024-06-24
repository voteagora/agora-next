import React from "react";
import { VStack } from "@/components/Layout/Stack";
import InfoHero from "@/components/Info/InfoHero";
import InfoAboutSection from "@/components/Info/InfoAboutSection";
import DaosTreasuryChart from "@/components/Info/DaosTreasuryChart";
import GovernorSettingAccordion from "@/components/Info/GovernorSettingAccordion";
import GovernanceChartsTabs from "@/components/Info/GovernanceChartsTabs";
import PortalTrafficTabs from "@/components/Info/PortalTrafficTabs";
import Tenant from "@/lib/tenant/tenant";

export async function generateMetadata({}) {
  const tenant = Tenant.current();
  const page = tenant.ui.page("proposals");
  const { title, description } = page.meta;

  const preview = `/api/images/og/proposals?title=${encodeURIComponent(
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
  if (!ui.toggle("info")) {
    return <div>Route not supported for namespace</div>;
  }

  return (
    <VStack className="font-inter">
      <InfoHero />
      <InfoAboutSection />
      <GovernorSettingAccordion />
      <DaosTreasuryChart />
      <GovernanceChartsTabs />
      <PortalTrafficTabs />
    </VStack>
  );
}
