/*
 * TanStack Start port of src/app/api/embeds/delegate/[addressOrENSName]/route.ts.
 * URL: GET /api/embeds/delegate/:addressOrENSName
 * Note: unstable_cache removed; responses rely on HTTP Cache-Control.
 */

import { createFileRoute } from "@tanstack/react-router";

import { withApiAuth } from "@/lib/start-server/withApiAuth";

export const Route = createFileRoute("/api/embeds/delegate/$addressOrENSName")({
  server: {
    handlers: {
      GET: withApiAuth(async ({ params }) => {
        const { fetchDelegate } = await import("@/app/delegates/actions");
        const { ensNameToAddress } = await import("@/app/lib/ENSUtils");
        const { default: Tenant } = await import("@/lib/tenant/tenant");
        const { formatNumber } = await import("@/lib/tokenUtils");

        try {
          const { addressOrENSName } = params;

          if (!addressOrENSName) {
            return Response.json(
              { error: "Address or ENS name is required" },
              { status: 400 }
            );
          }

          const address = await ensNameToAddress(addressOrENSName);
          const delegate = await fetchDelegate(address);
          const { token } = Tenant.current();

          const statement = delegate.statement?.payload?.delegateStatement;
          const forVotes = parseInt(delegate.votedFor || "0", 10);
          const againstVotes = parseInt(delegate.votedAgainst || "0", 10);
          const abstainVotes = parseInt(delegate.votedAbstain || "0", 10);

          const embedData = {
            address: delegate.address,
            votingPower: delegate.votingPower?.total
              ? `${formatNumber(delegate.votingPower.total)} ${token.symbol}`
              : "0",
            votingPowerRaw: delegate.votingPower?.total
              ? delegate.votingPower.total.toString()
              : "0",
            delegatorsCount: Number(delegate.numOfDelegators || 0n),
            proposalsCreated: Number(delegate.proposalsCreated || 0n),
            voteStats:
              forVotes + againstVotes + abstainVotes > 0
                ? { forVotes, againstVotes, abstainVotes }
                : undefined,
            statement: statement ? statement.slice(0, 150) : undefined,
            url: `/delegates/${addressOrENSName}`,
          };

          return new Response(JSON.stringify(embedData), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control":
                "public, s-maxage=300, stale-while-revalidate=600",
            },
          });
        } catch (error) {
          console.error("Error fetching delegate embed data:", error);
          return Response.json(
            { error: "Failed to fetch delegate data" },
            { status: 500 }
          );
        }
      }),
    },
  },
});
