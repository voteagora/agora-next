const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const projects = [
  {
    project_id: "layer3xyx",
    displayName: "Layer3",
    bio: "Layer3 makes learning and exploring crypto fun, engaging, and rewarding.",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0xE084ce2385eb56C42b65dA5d5B1205c3d4aD5d58.png",
    },
  },
  {
    project_id: "rabbithole",
    displayName: "RabbitHole",
    bio: "A protocol to target users & deploy onchain earning opportunities",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0x8F5415415d9200cCd8523F3Ee88F96F476141CC3.png",
    },
  },
  {
    project_id: "velodrome",
    displayName: "Velodrome",
    bio: "The central trading and liquidity marketplace on Optimism.",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0xc6E5084b11eE98da7bDBc4F9cabf5E17bb209652.png",
    },
  },
  {
    project_id: "galxe",
    displayName: "Galxe",
    bio: "Galxe is the leading platform for building web3 communities.",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0x638b91852B7459BE5158646bD0FAEcB7BAC4fca2.png",
    },
  },
  {
    project_id: "gitcoin",
    displayName: "Gitcoin",
    bio: "Gitcoin enables communities to build, fund and protect what matters to them.",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0xc2E2B715d9e302947Ec7e312fd2384b5a1296099.png",
    },
  },
  {
    project_id: "woonetwork",
    displayName: "WOOFi",
    bio: "One DEX to rule all chains. Trade and earn with best pricing, cross-chain swaps.",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0x7cBFd4f0De51124B498f72DEBC35421C66F2bB0d.png",
    },
  },
  {
    project_id: "voteagora",
    displayName: "Agora",
    bio: "Token house and Citizen house governance app and contract",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0xFdFC6E1BbEc01288447222fC8F1AEE55a7C72b7B.png",
    },
  },
  {
    project_id: "kwenta",
    displayName: "Kwenta",
    bio: "Kwenta is a perpetual futures exchange on Optimism",
    profile: {
      profileImageUrl: null,
    },
  },
  {
    project_id: "sonne-finance",
    displayName: "Sonne Finance ",
    bio: "Sonne Finance is a decentralized lending protocol, native on Optimism.",
    profile: {
      profileImageUrl: null,
    },
  },
  {
    project_id: "rainbow",
    displayName: "Rainbow Wallet",
    bio: "Fun, powerful, and secure wallets",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0x465E764B56429788e031160F66a5F9791193B56F.png",
    },
  },
  {
    project_id: "synthetix",
    displayName: "Synthetix IPFS Node",
    bio: "The gateway to decentralised frontends in the DeFi ecosystem",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0x98f763Ceb9d4D921cDfA688cB7D6419F967d28E7.png",
    },
  },
  {
    project_id: "synapse",
    displayName: "Synapse DAO",
    bio: "Synapse DAO maintains the Synapse Bridge and other onboarding tooling",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0x60d0edb6e40cd6BF0b1DFc90C58bA0D3Ed0C9A2d.png",
    },
  },
  {
    project_id: "hop-protocol",
    displayName: "Hop DAO",
    bio: "Hop DAO governs Hop Protocol and accelerates growth of the cross-chain ecosystem",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0x9f8d2dafE9978268aC7c67966B366d6d55e97f07.png",
    },
  },
  {
    displayName: "Kiwi News",
    bio: "Community-curated crypto media dapp & open source P2P protocol",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0xee324c588ceF1BF1c1360883E4318834af66366d.png",
    },
  },
  {
    displayName: "Giveth",
    bio: "Bringing nonprofits to Optimism & building towards “Impact = Profit” since 2016",
    profile: {
      profileImageUrl:
        "https://content.optimism.io/profile/v0/profile-image/10/0x634977e11C823a436e587C1a1Eca959588C64287.png",
    },
  },
];

const projectIds = [
  "d-hedge",
  "hypercerts",
  "synapse",
  "hop-protocol",
  "velodrome",
  "ethereum-attestation-service",
  "galxe",
  "tarot-finance",
  "slingshot",
  "layer3xyz",
  "aave",
  "wormhole",
  "connext",
  "rainbow",
  "extra-finance",
  "angle-protocol",
  "quest-3",
  "uniswap",
  "synthetix",
  "woonetwork",
  "pheasant-network",
  "beefy-finance",
  "debridge-finance",
  "zerion",
  "rabbithole",
  "granary",
  "voteagora",
  "kwenta",
  "zeroex",
  "metamask",
  "qidao-mai-finance",
  "kiwi-news-attestate",
  "defi-llama",
  "lido",
  "exactly",
  "safe-global",
  "fraxfinance",
  "superfluid",
  "kyber-swap",
  "1-inch",
  "stargate-finance",
  "giveth",
  "overnight",
  "thales",
  "paraswap",
  "sonne-finance",
  "metronome-autonomoussoftware",
  "gitcoin",
  "magpiexyz",
  "beethoven-x",
];

async function main() {
  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const formatProjectName = (projectId) => {
    return projectId
      .split("-")
      .map((word) => capitalizeFirstLetter(word))
      .join(" ");
  };

  const result = projectIds.map((id) => {
    const project = projects.find((proj) => proj.project_id === id);
    return {
      project_id: id,
      project_name: project ? project.displayName : formatProjectName(id),
      profileImageUrl:
        project && project.profile ? project.profile.profileImageUrl : "",
    };
  });

  for (const project of result) {
    await prisma.projects_data.upsert({
      where: { project_id: project.project_id },
      update: {
        project_name: project.project_name,
        project_image: project.profileImageUrl,
      },
      create: {
        project_id: project.project_id,
        project_name: project.project_name,
        project_image: project.profileImageUrl,
      },
    });
  }

  console.log("Projects data loaded successfully.");
}

main();
