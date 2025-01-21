// The block number when analytics were turned on for each chain
// The idea here is that we want to ignore all events before this block number
// because we were not yet tracking events, so the data is stale.
// ---
// I decided not to use this feature because it was confusing to sort by
// "month" intervals and see absolutely nothing prior to this month for someone
// like OP just because we'd been filtering the query to only include events
// past the analytics date
// ---
// I think this idea has merit, so I want to keep this util here as a reminder
// in case we want to bring it back in. But for now I'd say we're good without it.
export const analyticsStartingBlockNumber = {
  1: 21570000, // mainnet
  11155111: 7280000, // sepolia
  10: 130330000, // optimism
  534352: 12520000, // scroll
  7560: 11420000, // cyber
};

export const hourInBlocks = {
  1: 1200, // mainnet
  11155111: 1200, // sepolia
  10: 1200, // optimism
  534352: 1200, // scroll
  7560: 1200, // cyber
};
