"use client";

import { useAccount } from "wagmi";

const SponsorAuthCheck = ({
  sponsorAddress,
  children,
}: {
  sponsorAddress: string;
  children: React.ReactNode;
}) => {
  const { address } = useAccount();

  if (sponsorAddress !== address) {
    return <div>Unauthorized</div>;
  }

  return <>{children}</>;
};

export default SponsorAuthCheck;
