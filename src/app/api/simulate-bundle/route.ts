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
    const body = await request.json();
    const user = process.env.TENDERLY_USER;
    const project = process.env.TENDERLY_PROJECT;

    const transactions = body?.transactions.map((transaction: any) => {
      return {
        to: transaction.target,
        input: transaction.calldata,
        value: transaction.value,
        gas: 8000000,
        gas_price: 0,
        network_id: body?.networkId || "1",
        from: body?.from || "", // governor address
        save: true, // if true simulation is saved and shows up in the dashboard
        save_if_fails: true, // if true, reverting simulations show up in the dashboard
        simulation_type: "quick", // full or quick (full is default)
      };
    });

    const response = await fetch(
      `https://api.tenderly.co/api/v1/account/${user}/project/${project}/simulate-bundle`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Access-Key": process.env.TENDERLY_ACCESS_KEY as string,
        },
        body: JSON.stringify({
          simulations: transactions,
        }),
      }
    );
    const res = await response.json();

    const simulation_ids = res.simulation_results.map(
      (result: any) => result.simulation.id
    );

    // enable sharing on all of the simulations
    await Promise.all(
      simulation_ids.map(async (id: string) => {
        await fetch(
          `https://api.tenderly.co/api/v1/account/${user}/project/${project}/simulations/${id}/share`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Access-Key": process.env.TENDERLY_ACCESS_KEY as string,
            },
          }
        );
      })
    );

    return NextResponse.json({ response: res });
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
