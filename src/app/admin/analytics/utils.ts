// The block number when analytics were turned on for each chain
// The idea here is that we want to ignore all events before this block number
// because we were not yet tracking events, so the data is stale.
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
