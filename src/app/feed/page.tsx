import prisma from "@/app/lib/prisma";

/**
 * TODO: frh ->
 *
 * 1.  Experiment with a query where max 20 or 37 events are scanned, since right now there are 37 tables on center db
 *     with _events. Try union all and check speeds.
 * 2.  Check delegated events, partial delegation vs not partial delegation. Check voted for all kinds of proposals,
 *     check with params in vote. Check proposal creation events. Check other types of events.
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
 * On linear issue this are the events:
 * Delegations
 * Partial delegations
 * Proposal Creation
 * Does not say anything about votes but i am going to include everything for the best UX following the
 * "all of the events of the DAO together."
 */

export default async function Page() {
  return <span>events page</span>;
}
