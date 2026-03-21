import { NextRequest } from "next/server";
import { authenticateApiUser } from "@/app/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  const authResponse = await authenticateApiUser(request);
  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 });
  }

  const body = await request.json();
  const user = process.env.TENDERLY_USER;
  const project = process.env.TENDERLY_PROJECT;

  try {
    const response = await fetch(
      `https://api.tenderly.co/api/v1/account/${user}/project/${project}/simulate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Access-Key": process.env.TENDERLY_ACCESS_KEY as string,
        },
        body: JSON.stringify({
          /* Simulation Configuration */
          save: true, // if true simulation is saved and shows up in the dashboard
          save_if_fails: true, // if true, reverting simulations show up in the dashboard
          simulation_type: "quick", // full or quick (full is default)
          network_id: body?.networkId || "1", // network to simulate on
          /* Standard EVM Transaction object */
          from: body?.from || "", // timelock address
          to: body?.target || "",
          input: body?.calldata || "0x",
          gas: 8000000,
          gas_price: 0,
          value: body?.value || 0,
        }),
      }
    );
    const res = await response.json();

    // Enable sharing on the simulation
    await fetch(
      `https://api.tenderly.co/api/v1/account/${user}/project/${project}/simulations/${res.simulation.id}/share`,
      {
        method: "POST",
        headers: {
          "X-Access-Key": process.env.TENDERLY_ACCESS_KEY as string,
        },
      }
    );

    return new Response(JSON.stringify({ response: res }), {
      status: 200,
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        error: e?.response?.data?.error?.message || e?.message || e,
      }),
      {
        status: 500,
      }
    );
  }
}
