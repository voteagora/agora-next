"use server";

import React from "react";
import Link from "next/link";
import { StakeAndDelegate } from "@/app/staking/components/StakeAndDelegate";

export default async function Page({ params: { deposit_id } }) {
  return (
    <div className="mt-12">
      <div className="mb-4">
        <Link href="/staking" title="Back to staking">
          Back
        </Link>
      </div>

      <StakeAndDelegate />
    </div>
  );
}
