import { getFeedLogs } from "@/app/api/feed/getFeedLogs";
import FeedEventFilter from "@/components/Feed/FeedEventFilter";
import BlockDate from "@/components/Feed/BlockDate";

async function getLogs(params: {
  page?: number;
  sort?: string;
  seed?: number;
  event: "all" | "delegations" | "votes";
}) {
  "use server";

  return getFeedLogs(params);
}

/**
 * TODO: frh -> I assume having a feed of proposal creation makes no sense since this can already be seen in current page and there are 55 proposals
 * TODO: frh ->
 *
 * 1.  See how to get date from events
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
 */

export default async function Page({
  searchParams,
}: {
  searchParams: { event: "all" | "delegations" | "votes" };
}) {
  const logs = await getLogs({ event: searchParams?.event });

  return (
    <>
      <FeedEventFilter />
      <div className="flex flex-col gap-4">
        {/* TODO: frh -> optimize this reverse */}
        {logs.map((log) => {
          // Block number, block hash, transaction index and transaction hash can be the same in many elements
          // args provides a decoded, human-readable representation of the event data, topics includes the hashed event signature and indexed parameters, and data contains the raw, encoded event data, which often requires decoding based on the contract's ABI
          const {
            address,
            block_number,
            block_hash,
            transaction_hash,
            inputs,
            sighash,
          } = log;
          return (
            <div
              // logIndex represents the position or index of a specific log entry within the block in which it is included.
              key={sighash + block_hash + transaction_hash}
              className="flex flex-col gap-1 bg-gray-300 rounded-xl p-4"
            >
              <span>
                Block number: {block_number.toString()}{" "}
                {/* {new Date(Number(timestamp) * 1000).toString()} */}
              </span>
              <span>Contract: {address}</span>
              <span>Args: {JSON.stringify(inputs)}</span>
              <span>Event name: {sighash}</span>
              <BlockDate blockNumber={block_number} />
            </div>
          );
        })}
      </div>
    </>
  );
}
