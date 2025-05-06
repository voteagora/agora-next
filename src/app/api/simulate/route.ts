import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { authenticateApiUser } = await import("@/app/lib/auth/serverAuth");
  const { default: Tenant } = await import("@/lib/tenant/tenant");

  const authResponse = await authenticateApiUser(request);

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const { namespace } = Tenant.current();

  try {
    const { to, data } = await request.json();
    const user = process.env.TENDERLY_USER;
    const project = process.env.TENDERLY_PROJECT;

    const response = await fetch(
      `https://api.tenderly.co/api/v1/account/${user}/project/${project}/simulate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Access-Key": process.env.TENDERLY_ACCESS_KEY || "",
        },
        body: JSON.stringify({
          save: true,
          save_if_fails: true,
          simulation_type: "quick",
          network_id: "1",
          from: "0x0000000000000000000000000000000000000000",
          to,
          input: data,
          gas: 8000000,
          gas_price: "0",
          value: 0,
          access_list: [],
          generate_access_list: true,
        }),
      }
    );

    const res = await response.json();
    return NextResponse.json({ response: res });
  } catch (e: any) {
    return new Response("Internal server error: " + e.toString(), {
      status: 500,
    });
  }
}
