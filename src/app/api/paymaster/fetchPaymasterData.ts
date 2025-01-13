"use server";

import Tenant from "@/lib/tenant/tenant";

export const fetchPaymasterData = async (params: any) => {
  const { ui } = Tenant.current();

  if (!ui.smartAccountConfig) {
    throw new Error("Missing Smart Account Config");
  }

  const response = await fetch(ui.smartAccountConfig!.paymasterUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secret: process.env.PAYMASTER_SECRET,
      userOp: params,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      "failed to fetch paymaster data:" + (await response.text())
    );
  }

  const { paymasterAndData }: { paymasterAndData: `0x${string}` } =
    await response.json();

  return paymasterAndData;
};
