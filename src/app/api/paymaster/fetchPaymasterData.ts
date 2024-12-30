"use server";

export const fetchPaymasterData = async (params: any) => {
  const response = await fetch("https://derive.xyz/api/paymaster", {
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
