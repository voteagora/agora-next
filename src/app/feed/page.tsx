import getFeedLogs from "@/lib/serverGetFeedLogs";

async function getLogs() {
  "use server";

  return getFeedLogs();
}

/**
 * TODO: frh ->
 *
 * 1.  Then check subdelegation error
 * 2.  Think about "more tweets" style for updating feed
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
  let uniqueEvents = logs
    .filter((v, i, a) => a.findIndex((t) => t.eventName === v.eventName) === i)
    .map((item) => item.eventName);

  console.log("uniqueEvents: ", uniqueEvents);
  return (
    <div className="flex flex-col gap-4">
      {/* TODO: frh -> optimize this reverse */}
      {logs.reverse().map((log, i) => {
        // Block number, block hash, transaction index and transaction hash can be the same in many elements
        // args provides a decoded, human-readable representation of the event data, topics includes the hashed event signature and indexed parameters, and data contains the raw, encoded event data, which often requires decoding based on the contract's ABI
        const {
          address,
          blockNumber,
          blockHash,
          args,
          logIndex,
          eventName,
          data,
        } = log;
        return (
          <div
            // logIndex represents the position or index of a specific log entry within the block in which it is included.
            key={data + blockHash + logIndex}
            className="flex flex-col gap-1 bg-gray-300 rounded-xl p-4"
          >
            <span>Contract: {address}</span>
            <span>Block Number: {blockNumber.toString()}</span>
            <span>Args: {JSON.stringify(args)}</span>
            <span>Event name: {eventName}</span>
          </div>
        );
      })}
    </div>
  );
}
