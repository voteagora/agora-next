import { ReactNode } from "react";
import IPData from "ipdata";
import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Cuba, Iran, North Korea, Syria, and Russia are blocked from participating in the airdrop
const BLOCKED_COUNTRIES = ["CU", "IR", "KP", "SY", "RU"];

// The following ISO 3166-2 codes are for Crimea, Donetsk and Luhansk regions of occupied Ukraine
// https://www.iso.org/obp/ui/#iso:code:3166:UA
const BLOCKED_REGIONS = ["UA-43", "UA-14", "UA-09"];

interface Props {
  children: ReactNode;
  enabled: boolean;
}

const ipData = new IPData(process.env.IP_DATA_API_KEY!, {
  maxAge: 3600,
});

export const IPBlocker = async ({ children, enabled }: Props) => {
  if (!enabled) {
    return <>{children}</>;
  }

  try {
    const ip = await ipData.lookup();
    if (
      BLOCKED_COUNTRIES.includes(ip.country_code) ||
      (ip.region_code && BLOCKED_REGIONS.includes(ip.region_code))
    ) {
      return <AccessRestricted />;
    }
  } catch (error) {
    return (
      <>Error determining your location. Please come back later to try again.</>
    );
  }
  return <>{children}</>;
};

const AccessRestricted = () => {
  const { ui } = Tenant.current();

  return (
    <div className="flex flex-col w-full h-screen items-center justify-center gap-2">
      <Image src={ui.logo} alt="logo" width="68" height="68" />

      <div className="font-semibold text-xl mt-4">Access Restricted</div>
      <div className="text-sm">
        Unfortunately, the airdrop is not available in your region.
      </div>
      <Button className="mt-4" variant="outline">
        Learn more
      </Button>
    </div>
  );
};
