"use client";

import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { TreasuryWrappedBanner } from "./TreasuryWrappedBanner";

export function TreasuryWrappedBannerWrapper() {
  const { ui } = Tenant.current();
  const showBanner = ui.toggle("syndicate-duna-disclosures")?.enabled === true;

  if (!showBanner) {
    return null;
  }

  return <TreasuryWrappedBanner />;
}
