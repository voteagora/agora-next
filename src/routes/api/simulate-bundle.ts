/*
 * TanStack Start port of src/app/api/simulate-bundle/route.ts.
 * URL: POST /api/simulate-bundle
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/simulate-bundle")({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request }) => {
        const { authenticateApiUser } = await import(
          "@/app/lib/auth/serverAuth"
        );

        const authResponse = await authenticateApiUser(request as never);
        if (!authResponse.authenticated) {
          return new Response(authResponse.failReason, { status: 401 });
        }

        const body = await request.json();
        const user = process.env.TENDERLY_USER;
        const project = process.env.TENDERLY_PROJECT;

        const transactions = body?.transactions.map(
          (transaction: {
            target: string;
            calldata: string;
            value: string;
          }) => ({
            to: transaction.target,
            input: transaction.calldata,
            value: transaction.value,
            gas: 8000000,
            gas_price: 0,
            network_id: body?.networkId || "1",
            from: body?.from || "",
            save: true,
            save_if_fails: true,
            simulation_type: "quick",
          })
        );

        try {
          const response = await fetch(
            `https://api.tenderly.co/api/v1/account/${user}/project/${project}/simulate-bundle`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Access-Key": process.env.TENDERLY_ACCESS_KEY as string,
              },
              body: JSON.stringify({ simulations: transactions }),
            }
          );
          const res = await response.json();

          const simulation_ids = res.simulation_results.map(
            (result: { simulation: { id: string } }) => result.simulation.id
          );

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

          return new Response(JSON.stringify({ response: res }), {
            status: 200,
          });
        } catch (e: unknown) {
          const err = e as {
            response?: { data?: { error?: { message?: string } } };
            message?: string;
          };
          return new Response(
            JSON.stringify({
              error:
                err?.response?.data?.error?.message ||
                err?.message ||
                String(e),
            }),
            { status: 500 }
          );
        }
      }),
    },
  },
});
