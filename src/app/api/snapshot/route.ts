import prisma from "@/app/lib/prisma";

const url = "https://hub.snapshot.org/graphql";

async function fetchProposals() {
  const query = `
      query {
        items: proposals(
          where: { space: "ens.eth", flagged: false }
          orderBy: "created"
          orderDirection: asc
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
  try {
    const proposals = await fetchProposals();

    for await (const proposal of proposals) {
      console.log(proposal);
      await prisma.snapshotProposal.upsert({
        where: { id: proposal.id },
        update: proposal,
        create: proposal,
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
}
