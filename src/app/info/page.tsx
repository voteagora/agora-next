import { VStack } from "@/components/Layout/Stack";
import InfoHero from "@/components/Info/InfoHero";
import InfoAboutSection from "@/components/Info/InfoAboutSection";

export default async function Info() {
  return (
    <VStack className="font-inter">
      <InfoHero />
      <InfoAboutSection />
    </VStack>
  );
}
