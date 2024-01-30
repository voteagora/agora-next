import prisma from "@/app/lib/prisma";

/**
 * TODO: frh ->
 *
 * On linear issue this are the events:
 * Delegations
 * Partial delegations
 * Proposal Creation
 * Does not say anything about votes but i am going to include everything for the best UX following the
 * "all of the events of the DAO together."
 *
 * 0.  Create views of missing events
 * 1.  I should look for delegated to and voted for events.
 * 2.  Check how many events in current uniswap.
 * 3.  Check delegated events, partial delegation vs not partial delegation included vs when you move a token.
 * 4.  Check voted for all kinds of proposals, check with params in vote.
 * 5.  Check proposal creation events.
 * 6.  Check other types of events.
 * 7.  Think about cool filters for this page, some ideas right now are filter by address, filter by action (delegate,
 *     vote, proposal creation), by volume, by date, think about current ux. See how all this events can be aggregated
 *     together for filtering.
 * 8.  Think about infiniteScroll.
 * 9.  Think about server action (SEO) and check performance in prod, also of filtering.
 * 10. Think about cool styles, ui and ux, for example, images on ens addresses.
 * 11. Think about linking with current urls of user.
 * 12. Do the actual query.
 * 13. Think about splitting PR at this point, before tabs in mobile.
 * 14. Think about current tabs and in mobile.
 * 15. Lastly research some other projects and feed for ideas.
 */

export default async function Page() {
  // Query for votes events
  const votes = await prisma.votes.findMany({
    where: {
      voter: "0xe538f6f407937ffDEe9B2704F9096c31c64e63A8".toLowerCase(),
    },
  });
  console.log("votes events done: ", votes);

  // Query for proposals events
  //   const proposals = await prisma.proposalsData.findMany({
  //     take: 20,
  //     orderBy: [
  //       {
  //         block_number: "desc",
  //       },
  //     ],
  //   });
  //   console.log("proposals: ", proposals);

  return <span>hello</span>;
}
