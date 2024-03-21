import prisma from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { DaoSlug } from "@prisma/client";

/**
 * This is a basic snapshot indexer. It fetches all proposals from the ENS space
 * and upserts them into the database.
 *
 * Snapshot API has a limit of 1000 items per request
 * There's currently no pagination as there's a lot less than 1000 proposals in the ENS space
 */

const url = "https://hub.snapshot.org/graphql";
const namespaces = {
  ENS: "ens.eth",
};

async function fetchProposals(slug: string) {
  const query = `
      query {
        items: proposals(
          where: { space: "${slug}", flagged: false }
          orderBy: "created"
          orderDirection: asc,
          first: 1000
        ) {
          id
          author
          body
          choices
          created
          end
          link
          network
          scores
          scores_state
          scores_total
          scores_updated
          snapshot
          start
          state
          title
          type
          votes
        }
      }
    `;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  };

  const response = await fetch(url, options);
  const data = await response.json();
  return data.data.items;
}

export async function GET() {
  // Only allow this route to be accessed from the ENS namespace
  const slug = Tenant.current().slug;
  if (slug === DaoSlug.ENS) {
    try {
      const proposals = await fetchProposals(namespaces[slug]);

      for await (const proposal of proposals) {
        await prisma.snapshotProposal.upsert({
          where: { id: proposal.id },
          update: { ...proposal, dao_slug: slug },
          create: { ...proposal, dao_slug: slug },
        });
      }

      return new Response(`Updated: ${proposals.length} proposals`, {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }
  } else {
    return new Response("Route not supported for namespace", {
      headers: { "Content-Type": "application/json" },
      status: 404,
    });
  }
}
