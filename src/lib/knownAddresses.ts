/**
 * Known contract addresses and schema UIDs for Pretty View rendering.
 * All addresses are stored lowercase for consistent lookups.
 */

export const KNOWN_ADDRESSES: Record<string, string> = {
  // ─── Uniswap Core (Ethereum Mainnet) ───

  "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "UNI",
  "0x1f98431c8ad98523631ae4a59f267346ea31f984": "Uniswap V3 Factory",
  "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f": "Uniswap V2 Factory",
  "0x18e433c7bf8a2e1d0197ce5d8f9afada1a771360": "Uniswap V2 FeeToSetter",
  "0x1a9c8182c09f50c8318d769245bea52c32be35bc": "Governance Timelock",
  "0x000000000000000000000000000000000000dead": "Burn address",

  // ─── Protocol Fees (Ethereum Mainnet) ───

  "0xd3aa12b99892b7d95bbaa27aef222a8e2a038c0c": "Mainnet Deployer",
  "0xf38521f130fccf29db1961597bc5d2b60f995f85": "Token Jar",
  "0x0d5cd355e2abeb8fb1552f56c965b867346d6721": "Releaser (Firepit)",
  "0x5e74c9f42eed283bff3744fbd1889d398d40867d": "Uniswap V3 Fee Adapter",
  "0xf2371551fe3937db7c750f4dfabe5c2fffdcbf5a": "V3 Open Fee Adapter",
  "0xca046a83edb78f74ae338bb5a291bf6fdac9e1d2": "UNI Vester",
  "0xc707467e7fb43fe7cc55264f892dd2d7f8fc27c8": "Agreement Anchor 1",
  "0x33a56942fe57f3697fe0ff52ab16cb0ba9b8eadd": "Agreement Anchor 2",
  "0xf9f85a17cc6de9150cd139f64b127976a1de91d1": "Agreement Anchor 3",

  // ─── External Contracts ───

  "0xa1207f3bba224e2c9c3c6d5af63d0eb1582ce587": "EAS Attestation Service",
  "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41": "ENS Public Resolver",
  "0x3b59c6d0034490093460787566dc5d6ce17f2f9c": "uac.eth",
  "0x8f72fcf695523a6fc7dd97eafdd7a083c386b7b6": "SEAL Safe Harbor Registry",

  // ─── Bridge Contracts (L1) ───

  "0x25ace71c97b33cc4729cf772ae268934f7ab5fa1":
    "OP Mainnet L1 Cross Domain Messenger",
  "0x866e82a600a1414e583f7f13623f1ac5d58b0afa":
    "Base L1 Cross Domain Messenger",
  "0x4dbd4fc535ac27206064b68ffcf827b0a60bab3f": "Arbitrum One Inbox",
  "0xf5f4496219f31cdcba6130b5402873624585615a":
    "Uniswap Wormhole Message Sender",
  "0x98f3c9e6e3face36baad05fe09d375ef1464288b": "Wormhole Core Bridge",
  "0xfe5e5d361b2ad62c541bab87c45a0b9b018389a2": "Polygon Fx Root",

  // ─── OP Mainnet (L2) ───

  "0xa1dd330d602c32622aa270ea73d078b803cb3518":
    "OP Mainnet Cross Chain Account",
  "0xec23cf5a1db3dcc6595385d28b2a4d9b52503be4":
    "OP Mainnet V3 Open Fee Adapter",
  "0x0c3c1c532f1e39edf36be9fe0be1410313e074bf": "OP Mainnet V2 Factory",
  "0xb13285df724ea75f3f1e9912010b7e491dcd5ee3": "OP Mainnet Token Jar",

  // ─── Base (L2) ───

  "0x31fafd4889fa1269f7a13a66ee0fb458f27d72a9": "Base Cross Chain Account",
  "0x33128a8fc17869897dce68ed026d694621f6fdfd": "Base V3 Factory",
  "0xabea76658b205696d49b5f91b2a03536cb8a3be1": "Base V3 Open Fee Adapter",
  "0x8909dc15e40173ff4699343b6eb8132c65e18ec6": "Base V2 Factory",
  "0x9bd25e67bf390437c8faf480ac735a27bcf6168c": "Base Token Jar",

  // ─── Arbitrum (L2) ───

  "0x2bad8182c09f50c8318d769245bea52c32be46cd": "Arbitrum Aliased Timelock",
  "0xff7ad5da31fecdc678796c88b05926db896b0699": "Arbitrum V3 Open Fee Adapter",
  "0xf1d7cc64fb4452f05c498126312ebe29f30fbcf9": "Arbitrum V2 Factory",
  "0x95e337c5b155385945d407f5396387d0c2a3a263": "Arbitrum Token Jar",

  // ─── Soneium (L2) ───

  "0x88e529a6ccd302c948689cd5156c83d4614fae92": "Soneium Optimism Portal",
  "0x42ae7ec7ff020412639d443e245d936429fbe717": "Soneium V3 Factory",
  "0x47cf920815344fd684a48bbefcbfbed9c7ae09cf": "Soneium V3 Open Fee Adapter",
  "0x97febbc2adbd5644ba22736e962564b23f5828ce": "Soneium V2 Factory",
  "0x85aeb792b94a9d79741002fc871423ec5dad29e9": "Soneium Token Jar",

  // ─── X Layer (L2) ───

  "0x64057ad1ddac804d0d26a7275b193d9daca19993": "X Layer Optimism Portal",
  "0x4b2ab38dbf28d31d467aa8993f6c2585981d6804": "X Layer V3 Factory",
  "0x6a88ef2e6511caffe2d006e260e7a5d1e7d4d7d7": "X Layer V3 Open Fee Adapter",
  "0xdf38f24fe153761634be942f9d859f3dba857e95": "X Layer V2 Factory",
  "0x8dd8b6d56e4a4a158edbbfe7f2f703b8ffc1a754": "X Layer Token Jar",

  // ─── Celo (L2) ───

  "0x1ac1181fc4e4f877963680587aeaa2c90d7ebb95":
    "Celo L1 Cross Domain Messenger",
  "0xafe208a311b21f13ef87e33a90049fc17a7acdec": "Celo V3 Factory",
  "0x79a530c8e2fa8748b7b40dd3629c0520c2ccf03f": "Celo V2 Factory",
  "0x288dc841a52fca2707c6947b3a777c5e56cd87bc": "Celo V4 Pool Manager",
  "0x044aaf330d7fd6ae683eec5c1c1d1fff5196b6b7": "Celo Cross Chain Account",
  "0xb9952c01830306ea2faae1505f6539bd260bfc48": "Celo V3 Open Fee Adapter",
  "0x190c22c5085640d1cb60cec88a4f736acb59bb6b": "Celo Token Jar",

  // ─── Worldchain (L2) ───

  "0xf931a81d18b1766d15695ffc7c1920a62b7e710a":
    "Worldchain L1 Cross Domain Messenger",
  "0xcb2436774c3e191c85056d248ef4260ce5f27a9d":
    "Worldchain Cross Chain Account",
  "0x7a5028bda40e7b173c278c5342087826455ea25a": "Worldchain V3 Factory",
  "0x1ce9d4dfb474ef9ea7dc0e804a333202e40d6201":
    "Worldchain V3 Open Fee Adapter",
  "0xbdb82c2de7d8748a3e499e771604ef8ef8544918": "Worldchain Token Jar",

  // ─── Zora (L2) ───

  "0xdc40a14d9abd6f410226f1e6de71ae03441ca506":
    "Zora L1 Cross Domain Messenger",
  "0x36eec182d0b24df3dc23115d64db521a93d5154f": "Zora Cross Chain Account",
  "0x7145f8aeef1f6510e92164038e1b6f8cb2c42cbb": "Zora V3 Factory",
  "0xbfc49b47637a4dc9b7b8de8e71bf41e519103b95": "Zora V3 Open Fee Adapter",
  "0x0f797dc7efaea995bb916f268d919d0a1950ee3c": "Zora V2 Factory",
  "0x4753c137002d802f45302b118e265c41140e73c2": "Zora Token Jar",

  // ─── Protocol Guild (Ethereum Mainnet) ───

  "0x85d6bcc74877a1c6fc66a8cd14369f939663f68f": "Protocol Guild Governor",
  "0xaac9059248a06233db16fc9c25426365b7afb481": "Protocol Guild Timelock",
  "0x949f5b6183aa74272ddad7f8f8dc309f8186e858": "Protocol Guild Membership",
  "0xd982477216dadd4c258094b071b49d17b6271d66":
    "Protocol Guild Split Wallet V2",

  // ─── Protocol Guild Distributed Tokens (Ethereum Mainnet) ───
  // Verified via Etherscan: symbol(), name(), decimals()

  "0x10dea67478c5f8c5e2d90e5e9b26dbe60c54d800": "TAIKO", // Taiko Token, 18 decimals
  "0x4d1c297d39c5c1277964d0e3f8aa901493664530": "PUFFER", // PUFFER governance token, 18 decimals
  "0xca14007eff0db1f8135f4c25b34de49ab0d42766": "STRK", // Starknet Token, 18 decimals
  "0x5afe3855358e112b5647b952709e6165e1c1eeee": "SAFE", // Safe Token, 18 decimals
  "0xe485e2f1bab389c08721b291f6b59780fec83fd7": "SHU", // Shutter Token, 18 decimals
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT", // Tether USD, 6 decimals
  "0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb": "ETHFI", // ether.fi governance token, 18 decimals
  "0xec53bf9167f50cdeb3ae105f56099aaab9061f83": "EIGEN", // EigenLayer Token, 18 decimals
  "0x14778860e937f509e651192a90589de711fb88a9": "CYBER", // CyberConnect Token, 18 decimals
  "0xe29797910d413281d2821d5d9a989262c8121cc2": "ELIMU", // elimu.ai Token, 18 decimals
  "0xd33526068d116ce69f19a9ee46f0bd304f21a51f": "RPL", // Rocket Pool Token, 18 decimals
  "0x31c8eacbffdd875c74b94b077895bd78cf1e64a3": "RAD", // Radicle Token, 18 decimals
  "0x1bab804803159ad84b8854581aa53ac72455614e": "SYND", // Syndicate Token, 18 decimals
  "0xb45ad160634c528cc3d2926d9807104fa3157305": "sDOLA", // Inverse Finance Staked DOLA, 18 decimals
  "0x0b010000b7624eb9b3dfbc279673c76e9d29d5f7": "OBOL", // Obol Network Token, 18 decimals
  "0x21b7db03d7f51edbd37a6682e43ad9ba0d145890": "CC", // Wrapped CurrencyCoin, 0 decimals

  // ─── Common ERC-20 Tokens (Ethereum Mainnet) ───

  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH", // Wrapped Ether, 18 decimals
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC", // USD Coin, 6 decimals
  "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI", // Dai Stablecoin, 18 decimals
  "0x514910771af9ca656af840dff83e8264ecf986ca": "LINK", // Chainlink Token, 18 decimals
  "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": "AAVE", // Aave Token, 18 decimals
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC", // Wrapped BTC, 8 decimals
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": "stETH", // Lido Staked Ether, 18 decimals
};

/** Schema UIDs stored without 0x prefix, lowercase. */
export const KNOWN_SCHEMAS: Record<string, string> = {
  "504f10498bcdb19d4960412dbade6fa1530b8eed65c319f15cbe20fadafe56bd":
    "DUNI Agreement EAS Schema",
};

/** Token decimals for accurate amount formatting. */
export const KNOWN_TOKEN_DECIMALS: Record<string, number> = {
  // Protocol Guild Distributed Tokens
  "0x10dea67478c5f8c5e2d90e5e9b26dbe60c54d800": 18, // TAIKO
  "0x4d1c297d39c5c1277964d0e3f8aa901493664530": 18, // PUFFER
  "0xca14007eff0db1f8135f4c25b34de49ab0d42766": 18, // STRK
  "0x5afe3855358e112b5647b952709e6165e1c1eeee": 18, // SAFE
  "0xe485e2f1bab389c08721b291f6b59780fec83fd7": 18, // SHU
  "0xdac17f958d2ee523a2206206994597c13d831ec7": 6, // USDT
  "0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb": 18, // ETHFI
  "0xec53bf9167f50cdeb3ae105f56099aaab9061f83": 18, // EIGEN
  "0x14778860e937f509e651192a90589de711fb88a9": 18, // CYBER
  "0xe29797910d413281d2821d5d9a989262c8121cc2": 18, // ELIMU
  "0xd33526068d116ce69f19a9ee46f0bd304f21a51f": 18, // RPL
  "0x31c8eacbffdd875c74b94b077895bd78cf1e64a3": 18, // RAD
  "0x1bab804803159ad84b8854581aa53ac72455614e": 18, // SYND
  "0xb45ad160634c528cc3d2926d9807104fa3157305": 18, // sDOLA
  "0x0b010000b7624eb9b3dfbc279673c76e9d29d5f7": 18, // OBOL
  "0x21b7db03d7f51edbd37a6682e43ad9ba0d145890": 0, // CC — non-standard, 0 decimals

  // Common ERC-20 Tokens
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": 18, // WETH
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 6, // USDC
  "0x6b175474e89094c44da98b954eedeac495271d0f": 18, // DAI
  "0x514910771af9ca656af840dff83e8264ecf986ca": 18, // LINK
  "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9": 18, // AAVE
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": 8, // WBTC
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84": 18, // stETH
};

export function getFriendlyName(address: string): string | null {
  return KNOWN_ADDRESSES[address.toLowerCase()] ?? null;
}

export function hasFriendlyName(address: string): boolean {
  return address.toLowerCase() in KNOWN_ADDRESSES;
}

export function getSchemaName(schemaUid: string): string | null {
  return KNOWN_SCHEMAS[schemaUid.toLowerCase().replace(/^0x/, "")] ?? null;
}

export function hasSchemaName(schemaUid: string): boolean {
  return schemaUid.toLowerCase().replace(/^0x/, "") in KNOWN_SCHEMAS;
}

export function getTokenDecimals(address: string): number | null {
  return KNOWN_TOKEN_DECIMALS[address.toLowerCase()] ?? null;
}
