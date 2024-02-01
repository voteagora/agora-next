import getFeedLogs from "@/lib/serverGetFeedLogs";

async function getLogs() {
  "use server";

  return getFeedLogs();
}

/**
 * TODO: frh ->
 *
 * 1.  Paint data and then check subdelegation error
 * 3.  Think about cool filters for this page, some ideas right now are filter by address, filter by action (delegate,
 *     vote, proposal creation), by volume, by date, think about current ux. See how all this events can be aggregated
 *     together for filtering.
 * 4.  Think about infiniteScroll.
 * 5.  Think about server action (SEO) and check performance in prod, also of filtering.
 * 6.  Think about cool styles, ui and ux, for example, images on ens addresses.
 * 7.  Think about linking with current urls of user.
 * 8.  Think about splitting PR at this point, before tabs in mobile.
 * 9.  Think about current tabs and in mobile.
 * 10. Lastly research some other projects and feed for ideas.
 *
 * 11. If time make a loading that it is not the whole page, maybe different PR but it is much more efficient for LCP.
 *
 * On linear issue this are the events:
 * Delegations
 * Partial delegations
 * Proposal Creation
 * Does not say anything about votes but i am going to include everything for the best UX following the
 * "all of the events of the DAO together."
 *
 */

export default async function Page() {
  const logs = await getLogs();
  console.log("logs: ", logs.length);
  let uniqueEvents = logs
    .filter((v, i, a) => a.findIndex((t) => t.eventName === v.eventName) === i)
    .map((item) => item.eventName);

  console.log("uniqueEvents: ", uniqueEvents);
  return <span>events page</span>;
}
