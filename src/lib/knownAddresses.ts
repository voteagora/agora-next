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
  "0xd982477216dadd4c258094b071b49d17b6271d66": "Protocol Guild Vesting Split",
};

/** Schema UIDs stored without 0x prefix, lowercase. */
export const KNOWN_SCHEMAS: Record<string, string> = {
  "504f10498bcdb19d4960412dbade6fa1530b8eed65c319f15cbe20fadafe56bd":
    "DUNI Agreement EAS Schema",
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
