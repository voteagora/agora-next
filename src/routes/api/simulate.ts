/*
 * TanStack Start port of src/app/api/simulate/route.ts.
 * URL: POST /api/simulate
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/simulate")({
  server: {
    handlers: {
      POST: withApiAuth(async ({ request }) => {
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
                save: true,
                save_if_fails: true,
                simulation_type: "quick",
                network_id: body?.networkId || "1",
                from: body?.from || "",
                to: body?.target || "",
                input: body?.calldata || "0x",
                gas: 8000000,
                gas_price: 0,
                value: body?.value || 0,
              }),
            }
          );
          const res = await response.json();

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
