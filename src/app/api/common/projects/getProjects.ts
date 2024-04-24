import { cache } from "react";

// TODO: Implement span for projects retrieval
async function getProjectsApi() {
  const pageMetadata = {
    hasNext: true,
    totalReturned: 1,
    nextOffset: 1,
  };
  const defaultSocialLinks = {
    twitter: "@flip_liquide",
    farcaster: "@flip-liquid",
    mirror: "",
    website: "flipliquid.xyz",
  };

  const defaultTeam = [
    {
      farcasterId: defaultSocialLinks.farcaster,
    },
  ];

  const defaultVCFunding = [
    {
      amount: "1000000000 Double Dollars",
      source: "Weyland-Yutani Venture Capital",
      date: "2024-04-20",
      details: "Seed round",
    },
  ];

  const defaultDeployedContracts = [
    {
      address: "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10",
      chainId: "10",
      deployer: "0x42004661285881D4B0F245B1eD3774d8166CF314",
      creationBlock: "71801427",
      transactionId:
        "0x6ff5f386e46b2fb0099a78429ecd104f552fe545c65d51068098211d8b11560d",
      verificationProof: "trust me ;)",
      openSourceObserverSlug: "---",
    },
  ];
  const defaultOptiGrants = [
    {
      amount: "2000000000 OP",
      source: "OP Foundation",
      date: "2024-04-20",
      details: "Great job!",
      link: "---",
      type: "DEVELOPMENT",
    },
  ];
  const defaultGrants = [
    {
      amount: "100 ETH",
      source: "Ethereum Foundation",
      date: "2024-04-20",
      details: "For being nice with it",
    },
  ];
  const defaultFunding = {
    ventureCapital: defaultVCFunding,
    grants: defaultGrants,
    optimismGrants: defaultOptiGrants,
  };
  const defaultCategories = [
    {
      name: "string",
      description: "string",
    },
  ];
  const defaultProject = {
    avatarUrl: "string",
    coverImageUrl: "string",
    attestationUid: "string",
    approvalAttestationUid: "string",
    name: "string",
    description: "string",
    externalLink: "string",
    socialLinks: defaultSocialLinks,
    team: defaultTeam,
    repositories: ["https://github.com/voteagora/agora-next"],
    deployedContracts: defaultDeployedContracts,
    categories: defaultCategories,
    funding: defaultFunding,
  };
  return {
    metadata: pageMetadata,
    projects: [defaultProject],
  };
}

export const fetchProjectsApi = cache(getProjectsApi);
