import { VStack } from "@/components/Layout/Stack";
import InfoHero from "@/components/Info/InfoHero";
import InfoAboutSection from "@/components/Info/InfoAboutSection";
import DaosTreasuryChart from "@/components/Info/DaosTreasuryChart";
import GovernorSettingAccordion from "@/components/Info/GovernorSettingAccordion";
import GovernanceChartsTabs from "@/components/Info/GovernanceChartsTabs";
import PortalTrafficTabs from "@/components/Info/PortalTrafficTabs";

export default async function Info() {
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
