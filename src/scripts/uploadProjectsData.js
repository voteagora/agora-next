const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const projects = [
  {
    id: "0x1d4a2c7e8f4a1d2e76f4b1d3c7e2f1a4b5d6c8f4a7d6e1f2c3a4b5d6e7f8a1c3",
    category_slug: "OP_STACK_TOOLING",
    name: "CryptoPaws",
    description:
      "Unleash your finances with CryptoPaws, the ultimate DeFi pet platform.",
    profileAvatarUrl:
      "https://content.optimism.io/profile/v0/profile-image/10/0xE084ce2385eb56C42b65dA5d5B1205c3d4aD5d58.png",
    projectCoverImageUrl: "",
    socialLinks: {
      twitter: "https://x.com/cryptopaws",
      farcaster: ["https://warpcast.com/cryptopaws"],
      mirror: null,
      website: ["https://cryptopaws.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/cryptopaws/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xF1a7eAc1a7d3c4d5b6f7e8a9d1c2a3e4b5d6f7e8",
        deploymentTxHash: "0x4b7c8d1e2f3a4b5d6c7e8a9d0e1f2a3b4c5d6e7f",
        deployerAddress: "0x72C8aE9d1e2f3c4b5d6f7a8b9c0d1e2f3a4b5c6d",
        chainId: 1,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "2m-3m",
          year: "2023",
          details: "Seed round led by Blockchain Ventures.",
        },
      ],
      grants: [
        {
          grant: "innovation-grant",
          link: "https://cryptopaws.io/grant",
          amount: "750000",
          date: "2023-04-15",
          details:
            "Awarded for groundbreaking advancements in DeFi technology.",
        },
      ],
      revenue: [
        {
          amount: "1m-2m",
          details: "Generated through platform fees and token sales.",
        },
      ],
    },
    organization: {
      name: "CryptoPaws Inc.",
      profileAvatarUrl: "",
    },
    links: ["https://cryptopaws.com", "https://blockchainnews.com/cryptopaws"],
  },
  {
    id: "0x2e4c8a3f7b1d2c4e5f7a9b1d2e3c4f5a6b7c8d9e0a1b2c3d4e5f6a7b8c9d0e1f",
    category_slug: "OP_STACK_RESEARCH_AND_DEVELOPMENT",
    name: "PixelVerse",
    description:
      "Explore the PixelVerse, a vibrant NFT universe for creators and collectors.",
    profileAvatarUrl:
      "https://content.optimism.io/profile/v0/profile-image/10/0x8F5415415d9200cCd8523F3Ee88F96F476141CC3.png",
    projectCoverImageUrl: "",
    socialLinks: {
      twitter: "https://x.com/pixelverse_nft",
      farcaster: ["https://warpcast.com/pixelverse"],
      mirror: null,
      website: ["https://pixelverse.art"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/pixelverse/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xE1f2d3c4b5a6f7e8d9c0b1a2e3f4d5c6b7a8f9d0",
        deploymentTxHash: "0x8b9c0d1e2f3a4b5c6d7e8a9d0e1f2c3b4a5d6e7f",
        deployerAddress: "0x91C2aD8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c",
        chainId: 137,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "1m-2m",
          year: "2022",
          details: "Initial funding to expand the PixelVerse ecosystem.",
        },
      ],
      grants: [
        {
          grant: "community-grant",
          link: "https://pixelverse.art/grant",
          amount: "500000",
          date: "2023-02-28",
          details:
            "Funding provided by the PixelVerse DAO for community-driven projects.",
        },
      ],
      revenue: [
        {
          amount: "750k-1m",
          details: "Revenue generated through NFT sales and marketplace fees.",
        },
      ],
    },
    organization: {
      name: "PixelVerse Labs",
      profileAvatarUrl: "",
    },
    links: ["https://pixelverse.org", "https://nftworlds.com/pixelverse"],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0x3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    category_slug: "ETHEREUM_CORE_CONTRIBUTIONS",
    name: "MetaCollective",
    description:
      "Join MetaCollective, a decentralized community shaping the future of the metaverse.",
    profileAvatarUrl:
      "https://content.optimism.io/profile/v0/profile-image/10/0xc6E5084b11eE98da7bDBc4F9cabf5E17bb209652.png",
    projectCoverImageUrl: "",
    socialLinks: {
      twitter: "https://x.com/metacollective_dao",
      farcaster: ["https://warpcast.com/metacollective"],
      mirror: null,
      website: ["https://metacollective.org"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/metacollective/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xA1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
        deploymentTxHash: "0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
        deployerAddress: "0x63D8bA2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
        chainId: 42161,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "1.5m-2m",
          year: "2021",
          details: "Funding received to establish the MetaCollective DAO.",
        },
      ],
      grants: [
        {
          grant: "ecosystem-grant",
          link: "https://metacollective.org/grant",
          amount: "600000",
          date: "2023-03-10",
          details:
            "Grant provided to support ecosystem development and growth.",
        },
      ],
      revenue: [
        {
          amount: "1.5m-2m",
          details: "Revenue from DAO membership fees and token staking.",
        },
      ],
    },
    organization: {
      name: "MetaCollective DAO",
      profileAvatarUrl: "",
    },
    links: [
      "https://metaverse.com/metacollective",
      "https://decentralized.org/metacollective",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0x4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
    category_slug: "OP_STACK_RESEARCH_AND_DEVELOPMENT",
    name: "BattleCraft",
    description:
      "Conquer the digital battlefield with BattleCraft, the ultimate blockchain strategy game.",
    profileAvatarUrl: "",
    projectCoverImageUrl: "",
    socialLinks: {
      twitter: "https://x.com/battlecraft_game",
      farcaster: ["https://warpcast.com/battlecraft"],
      mirror: null,
      website: ["https://battlecraft.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/battlecraft/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xD2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1",
        deploymentTxHash: "0xa9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8",
        deployerAddress: "0x84C9eF6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
        chainId: 56,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "3m-4m",
          year: "2023",
          details: "Series A funding led by GameFi Ventures.",
        },
      ],
      grants: [
        {
          grant: "innovation-grant",
          link: "https://battlecraft.io/grant",
          amount: "1.2m",
          date: "2023-05-05",
          details: "Awarded for innovative use of blockchain in gaming.",
        },
      ],
      revenue: [
        {
          amount: "3m-4m",
          details: "Revenue from in-game purchases and tokenomics.",
        },
      ],
    },
    organization: {
      name: "BattleCraft Studios",
      profileAvatarUrl: "",
    },
    links: ["https://battlecraftgame.com", "https://gamershub.com/battlecraft"],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a",
    category_slug: "ETHEREUM_CORE_CONTRIBUTIONS",
    name: "ChatterBox",
    description:
      "Redefine social interactions with ChatterBox, the decentralized messaging platform.",
    profileAvatarUrl:
      "https://content.optimism.io/profile/v0/profile-image/10/0x465E764B56429788e031160F66a5F9791193B56F.png",
    projectCoverImageUrl: "",
    socialLinks: {
      twitter: "https://x.com/chatterbox_dapp",
      farcaster: ["https://warpcast.com/chatterbox"],
      mirror: null,
      website: ["https://chatterbox.app"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/chatterbox/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xC3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
        deploymentTxHash: "0x7a8b9c0d1e2f3a4b5c6d7e8a9b0c1d2e3f4a5b6c",
        deployerAddress: "0x95D2eF7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
        chainId: 10,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "1m-2m",
          year: "2023",
          details: "Funding for platform development and user acquisition.",
        },
      ],
      grants: [
        {
          grant: "social-impact-grant",
          link: "https://chatterbox.app/grant",
          amount: "900000",
          date: "2023-07-01",
          details:
            "Awarded for enhancing privacy and security in communication.",
        },
      ],
      revenue: [
        {
          amount: "1m-1.5m",
          details: "Revenue from premium features and advertising.",
        },
      ],
    },
    organization: {
      name: "ChatterBox Labs",
      profileAvatarUrl: "",
    },
    links: [
      "https://chatworld.com/chatterbox",
      "https://technews.com/chatterbox",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0x6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f",
    category_slug: "OP_STACK_RESEARCH_AND_DEVELOPMENT",
    name: "Artify",
    description:
      "Empowering artists with Artify, the NFT platform for digital creators.",
    profileAvatarUrl:
      "https://content.optimism.io/profile/v0/profile-image/10/0x98f763Ceb9d4D921cDfA688cB7D6419F967d28E7.png",
    projectCoverImageUrl: "",
    socialLinks: {
      twitter: "https://x.com/artify_nft",
      farcaster: ["https://warpcast.com/artify"],
      mirror: null,
      website: ["https://artify.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/artify/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xF4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3",
        deploymentTxHash: "0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0a1b2c3d4e5f",
        deployerAddress: "0xA8F3dB7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
        chainId: 1,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "1m-1.5m",
          year: "2023",
          details: "Series A round led by Creative Ventures.",
        },
      ],
      grants: [
        {
          grant: "creator-grant",
          link: "https://artify.io/grant",
          amount: "700000",
          date: "2023-01-20",
          details: "Awarded to support emerging digital artists.",
        },
      ],
      revenue: [
        {
          amount: "1m-1.5m",
          details: "Revenue from NFT sales and platform fees.",
        },
      ],
    },
    organization: {
      name: "Artify Ltd.",
      profileAvatarUrl: "",
    },
    links: [
      "https://artworld.com/artify",
      "https://creativespotlight.com/artify",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0x7a8b9c0d1e2f3a4b5c6d7e8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
    category_slug: "OP_STACK_TOOLING",
    name: "TokenTrust",
    description:
      "Bringing transparency to finance with TokenTrust, the decentralized audit platform.",
    profileAvatarUrl:
      "https://storage.googleapis.com/op-atlas/7e8f9a0b1c2d3e4f5a6b7c8d9e0a1b2c.png",
    projectCoverImageUrl:
      "https://storage.googleapis.com/op-atlas/7a8b9c0d1e2f3a4b5c6d7e8a9b0c1d2e.png",
    socialLinks: {
      twitter: "https://x.com/tokentrust_finance",
      farcaster: ["https://warpcast.com/tokentrust"],
      mirror: null,
      website: ["https://tokentrust.org"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/tokentrust/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xC1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0",
        deploymentTxHash: "0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a",
        deployerAddress: "0x95D7eC8f9a0b1c2d3e4f5a6b7c8d9e0a1b2c3d4e",
        chainId: 10,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "2.5m-3m",
          year: "2022",
          details: "Series A funding from DeFi Capital.",
        },
      ],
      grants: [
        {
          grant: "security-grant",
          link: "https://tokentrust.org/grant",
          amount: "800000",
          date: "2022-12-15",
          details: "Grant awarded for developing advanced audit tools.",
        },
      ],
      revenue: [
        {
          amount: "1.5m-2m",
          details: "Revenue from audit services and token sales.",
        },
      ],
    },
    organization: {
      name: "TokenTrust Foundation",
      profileAvatarUrl: "",
    },
    links: [
      "https://financetrust.com/tokentrust",
      "https://auditblock.org/tokentrust",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0x8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",
    category_slug: "OP_STACK_RESEARCH_AND_DEVELOPMENT",
    name: "EduChain",
    description:
      "Revolutionizing education with EduChain, the blockchain-powered learning platform.",
    profileAvatarUrl:
      "https://storage.googleapis.com/op-atlas/8d9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b.png",
    projectCoverImageUrl:
      "https://storage.googleapis.com/op-atlas/8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f.png",
    socialLinks: {
      twitter: "https://x.com/educhain_platform",
      farcaster: ["https://warpcast.com/educhain"],
      mirror: null,
      website: ["https://educhain.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/educhain/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xA1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
        deploymentTxHash: "0x8b9c0d1e2f3a4b5c6d7e8a9d0e1f2c3b4a5d6e7f",
        deployerAddress: "0x72C8aD9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
        chainId: 137,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "3m-4m",
          year: "2023",
          details: "Series B funding from EduTech Ventures.",
        },
      ],
      grants: [
        {
          grant: "education-grant",
          link: "https://educhain.io/grant",
          amount: "1m",
          date: "2023-03-25",
          details:
            "Grant awarded for developing open-source educational resources.",
        },
      ],
      revenue: [
        {
          amount: "2m-3m",
          details: "Revenue from course sales and platform subscriptions.",
        },
      ],
    },
    organization: {
      name: "EduChain Labs",
      profileAvatarUrl: "",
    },
    links: [
      "https://blocklearn.com/educhain",
      "https://edtechnews.com/educhain",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e",
    category_slug: "OP_STACK_TOOLING",
    name: "ChainTrace",
    description:
      "Enhancing transparency in supply chains with ChainTrace, the blockchain tracking solution.",
    profileAvatarUrl:
      "https://storage.googleapis.com/op-atlas/9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c.png",
    projectCoverImageUrl:
      "https://storage.googleapis.com/op-atlas/9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a.png",
    socialLinks: {
      twitter: "https://x.com/chaintrace_io",
      farcaster: ["https://warpcast.com/chaintrace"],
      mirror: null,
      website: ["https://chaintrace.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/chaintrace/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xB6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
        deploymentTxHash: "0x9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
        deployerAddress: "0x84D7eE8f9a0b1c2d3e4f5a6b7c8d9e0a1b2c3d4e",
        chainId: 42161,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "2m-3m",
          year: "2023",
          details: "Series A funding from Logistics Ventures.",
        },
      ],
      grants: [
        {
          grant: "transparency-grant",
          link: "https://chaintrace.io/grant",
          amount: "750000",
          date: "2023-04-10",
          details:
            "Grant awarded for developing transparency tools in supply chains.",
        },
      ],
      revenue: [
        {
          amount: "1.5m-2m",
          details: "Revenue from tracking services and subscription fees.",
        },
      ],
    },
    organization: {
      name: "ChainTrace Inc.",
      profileAvatarUrl: "",
    },
    links: [
      "https://traceblock.com/chaintrace",
      "https://logisticsnews.com/chaintrace",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    category_slug: "ETHEREUM_CORE_CONTRIBUTIONS",
    name: "MediLink",
    description:
      "Connecting healthcare providers with MediLink, the blockchain health platform.",
    profileAvatarUrl:
      "https://storage.googleapis.com/op-atlas/a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7.png",
    projectCoverImageUrl:
      "https://storage.googleapis.com/op-atlas/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6.png",
    socialLinks: {
      twitter: "https://x.com/medilink_health",
      farcaster: ["https://warpcast.com/medilink"],
      mirror: null,
      website: ["https://medilink.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/medilink/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xC3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2",
        deploymentTxHash: "0xa8b9c0d1e2f3a4b5c6d7e8a9d0e1f2c3b4a5d6e7f",
        deployerAddress: "0x84D9fF7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
        chainId: 10,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "3m-4m",
          year: "2022",
          details: "Series A funding led by HealthTech Ventures.",
        },
      ],
      grants: [
        {
          grant: "healthcare-grant",
          link: "https://medilink.io/grant",
          amount: "1.5m",
          date: "2022-12-20",
          details:
            "Grant awarded for integrating blockchain into healthcare services.",
        },
      ],
      revenue: [
        {
          amount: "2.5m-3m",
          details: "Revenue from platform subscriptions and data services.",
        },
      ],
    },
    organization: {
      name: "MediLink Labs",
      profileAvatarUrl: "",
    },
    links: ["https://healthchain.com/medilink", "https://mednews.com/medilink"],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",
    category_slug: "OP_STACK_RESEARCH_AND_DEVELOPMENT",
    name: "InsureChain",
    description:
      "Revolutionizing insurance with InsureChain, the blockchain-based insurance platform.",
    profileAvatarUrl:
      "https://storage.googleapis.com/op-atlas/b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8.png",
    projectCoverImageUrl:
      "https://storage.googleapis.com/op-atlas/b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7.png",
    socialLinks: {
      twitter: "https://x.com/insurechain_platform",
      farcaster: ["https://warpcast.com/insurechain"],
      mirror: null,
      website: ["https://insurechain.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/insurechain/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xD4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
        deploymentTxHash: "0xa9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8",
        deployerAddress: "0x74C8eD6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
        chainId: 42161,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "2m-3m",
          year: "2023",
          details: "Series A funding led by InsureTech Capital.",
        },
      ],
      grants: [
        {
          grant: "innovation-grant",
          link: "https://insurechain.io/grant",
          amount: "900000",
          date: "2023-06-10",
          details:
            "Grant awarded for developing blockchain-based insurance solutions.",
        },
      ],
      revenue: [
        {
          amount: "1.5m-2m",
          details: "Revenue from insurance premiums and smart contracts.",
        },
      ],
    },
    organization: {
      name: "InsureChain Labs",
      profileAvatarUrl: "",
    },
    links: [
      "https://blockinsurance.com/insurechain",
      "https://techinsure.com/insurechain",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e",
    category_slug: "OP_STACK_RESEARCH_AND_DEVELOPMENT",
    name: "PropChain",
    description:
      "Transforming real estate with PropChain, the blockchain property platform.",
    profileAvatarUrl:
      "https://storage.googleapis.com/op-atlas/c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9.png",
    projectCoverImageUrl:
      "https://storage.googleapis.com/op-atlas/c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8.png",
    socialLinks: {
      twitter: "https://x.com/propchain_platform",
      farcaster: ["https://warpcast.com/propchain"],
      mirror: null,
      website: ["https://propchain.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/propchain/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xE5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4",
        deploymentTxHash: "0xb9c0d1e2f3a4b5c6d7e8a9d0e1f2c3b4a5d6e7f8a",
        deployerAddress: "0x63D7eE8f9a0b1c2d3e4f5a6b7c8d9e0a1b2c3d4e",
        chainId: 56,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "4m-5m",
          year: "2023",
          details: "Series A funding from RealTech Ventures.",
        },
      ],
      grants: [
        {
          grant: "innovation-grant",
          link: "https://propchain.io/grant",
          amount: "1m",
          date: "2023-07-15",
          details:
            "Grant awarded for developing blockchain solutions in real estate.",
        },
      ],
      revenue: [
        {
          amount: "3m-4m",
          details: "Revenue from property sales and smart contract services.",
        },
      ],
    },
    organization: {
      name: "PropChain Labs",
      profileAvatarUrl: "",
    },
    links: [
      "https://realestateblock.com/propchain",
      "https://propertynews.com/propchain",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0xd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f",
    category_slug: "OP_STACK_TOOLING",
    name: "VoteChain",
    description:
      "Securing democracy with VoteChain, the blockchain-based voting platform.",
    profileAvatarUrl:
      "https://storage.googleapis.com/op-atlas/d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.png",
    projectCoverImageUrl:
      "https://storage.googleapis.com/op-atlas/d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9.png",
    socialLinks: {
      twitter: "https://x.com/votechain_platform",
      farcaster: ["https://warpcast.com/votechain"],
      mirror: null,
      website: ["https://votechain.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/votechain/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xF6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5",
        deploymentTxHash: "0xb0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9",
        deployerAddress: "0x84D9eF7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
        chainId: 137,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "3m-4m",
          year: "2023",
          details: "Series B funding led by GovTech Capital.",
        },
      ],
      grants: [
        {
          grant: "democracy-grant",
          link: "https://votechain.io/grant",
          amount: "1.2m",
          date: "2023-06-30",
          details: "Grant awarded for enhancing security in digital voting.",
        },
      ],
      revenue: [
        {
          amount: "2.5m-3m",
          details: "Revenue from licensing fees and security audits.",
        },
      ],
    },
    organization: null,
    links: [
      "https://govblock.com/votechain",
      "https://democracytech.com/votechain",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0xe5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a",
    category_slug: "ETHEREUM_CORE_CONTRIBUTIONS",
    name: "EnergyWeb",
    description:
      "Powering the future with EnergyWeb, the blockchain energy platform.",
    profileAvatarUrl:
      "https://storage.googleapis.com/op-atlas/e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c.png",
    projectCoverImageUrl:
      "https://storage.googleapis.com/op-atlas/e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c.png",
    socialLinks: {
      twitter: "https://x.com/energyweb_platform",
      farcaster: ["https://warpcast.com/energyweb"],
      mirror: null,
      website: ["https://energyweb.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/energyweb/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xF7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6",
        deploymentTxHash: "0xb1c2d3e4f5a6b7c8d9e0a1b2c3d4e5f6a7b8c9d0",
        deployerAddress: "0x84E9fF7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
        chainId: 42161,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "4m-5m",
          year: "2023",
          details: "Series B funding led by EnergyTech Ventures.",
        },
      ],
      grants: [
        {
          grant: "renewable-energy-grant",
          link: "https://energyweb.io/grant",
          amount: "1.5m",
          date: "2023-05-15",
          details:
            "Grant awarded for integrating blockchain in renewable energy management.",
        },
      ],
      revenue: [
        {
          amount: "3m-4m",
          details: "Revenue from energy trading and platform services.",
        },
      ],
    },
    organization: null,
    links: [
      "https://powerblock.com/energyweb",
      "https://energynews.com/energyweb",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0xf6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b",
    category_slug: "OP_STACK_TOOLING",
    name: "IdenChain",
    description:
      "Securing identities with IdenChain, the blockchain-based identity platform.",
    profileAvatarUrl:
      "https://storage.googleapis.com/op-atlas/f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2.png",
    projectCoverImageUrl:
      "https://storage.googleapis.com/op-atlas/f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1.png",
    socialLinks: {
      twitter: "https://x.com/idenchain_platform",
      farcaster: ["https://warpcast.com/idenchain"],
      mirror: null,
      website: ["https://idenchain.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/idenchain/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xA9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8",
        deploymentTxHash: "0xb7c8d9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
        deployerAddress: "0x84C9eF6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
        chainId: 56,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "2.5m-3m",
          year: "2022",
          details: "Series A funding led by Identity Ventures.",
        },
      ],
      grants: [
        {
          grant: "security-grant",
          link: "https://idenchain.io/grant",
          amount: "800000",
          date: "2022-11-20",
          details:
            "Grant awarded for developing secure identity management tools.",
        },
      ],
      revenue: [
        {
          amount: "1.5m-2m",
          details:
            "Revenue from identity verification services and platform fees.",
        },
      ],
    },
    organization: null,
    links: [
      "https://identityblock.com/idenchain",
      "https://techidentity.com/idenchain",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0xa8b9c0d1e2f3a4b5c6d7e8a9d0e1f2c3b4a5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
    category_slug: "OP_STACK_RESEARCH_AND_DEVELOPMENT",
    name: "LogiChain",
    description:
      "Optimizing logistics with LogiChain, the blockchain supply chain solution.",
    profileAvatarUrl:
      "https://storage.googleapis.com/op-atlas/a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4.png",
    projectCoverImageUrl:
      "https://storage.googleapis.com/op-atlas/a8b9c0d1e2f3a4b5c6d7e8a9d0e1f2c3.png",
    socialLinks: {
      twitter: "https://x.com/logichain_platform",
      farcaster: ["https://warpcast.com/logichain"],
      mirror: null,
      website: ["https://logichain.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/logichain/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xD8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
        deploymentTxHash: "0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1",
        deployerAddress: "0x74D8eC7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d",
        chainId: 1,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "3m-4m",
          year: "2023",
          details: "Series A funding led by LogisticsTech Capital.",
        },
      ],
      grants: [
        {
          grant: "innovation-grant",
          link: "https://logichain.io/grant",
          amount: "1m",
          date: "2023-05-25",
          details:
            "Grant awarded for developing blockchain solutions in logistics.",
        },
      ],
      revenue: [
        {
          amount: "2.5m-3m",
          details:
            "Revenue from supply chain tracking services and subscription fees.",
        },
      ],
    },
    organization: null,
    links: [
      "https://supplyblock.com/logichain",
      "https://logisticnews.com/logichain",
    ],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
  {
    id: "0xb9c0d1e2f3a4b5c6d7e8a9d0e1f2c3b4a5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
    category_slug: "ETHEREUM_CORE_CONTRIBUTIONS",
    name: "IoTChain",
    description:
      "Connecting devices with IoTChain, the blockchain-based IoT platform.",
    profileAvatarUrl:
      "https://storage.googleapis.com/op-atlas/b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5.png",
    projectCoverImageUrl:
      "https://storage.googleapis.com/op-atlas/b9c0d1e2f3a4b5c6d7e8a9d0e1f2c3b4.png",
    socialLinks: {
      twitter: "https://x.com/iotchain_platform",
      farcaster: ["https://warpcast.com/iotchain"],
      mirror: null,
      website: ["https://iotchain.io"],
    },
    team: [
      {
        id: "62478f78-127b-49cd-baea-cba370470bbc",
        name: "Jonas",
        username: "jonassft",
        farcasterId: "191212",
        imageUrl: "https://i.imgur.com/aITPyu3.jpg",
        bio: "Contributing to RetroPGF @ Optimism",
        email: "d",
        emailVerified: false,
        github: "JSeiferth",
        notDeveloper: false,
        createdAt: "2024-05-22T19:20:11.991Z",
        updatedAt: "2024-08-23T09:35:29.486Z",
        deletedAt: null,
        object: "user",
        fid: 191212,
        custody_address: "0x29d417f4456d1ba69dcdcef6b86dc5a5b727ec50",
        display_name: "Jonas",
        pfp_url: "https://i.imgur.com/aITPyu3.jpg",
        profile: {
          bio: {
            text: "Contributing to RetroPGF @ Optimism",
          },
        },
        follower_count: 305,
        following_count: 90,
        verifications: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
        verified_addresses: {
          eth_addresses: ["0x4a6894dd556fab996f8d50b521f900caeedc168e"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "99b1cf9e-3e97-46f8-8ea4-875add11c274",
        name: "Stepan",
        username: "arsent",
        farcasterId: "17905",
        imageUrl: "https://i.imgur.com/c2Oz6SX.png",
        bio: "engineer @ agora.xyz",
        email: "stepan@voteagora.com",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-24T14:24:09.067Z",
        updatedAt: "2024-08-23T22:39:00.633Z",
        deletedAt: null,
        object: "user",
        fid: 17905,
        custody_address: "0x8013eab83b253fbe6cf183ad13c8d741f49be041",
        display_name: "Stepan",
        pfp_url: "https://i.imgur.com/c2Oz6SX.png",
        profile: {
          bio: {
            text: "Curious about privacy. Founding engineer @ agora.xyz",
          },
        },
        follower_count: 77,
        following_count: 98,
        verifications: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
        verified_addresses: {
          eth_addresses: ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "fa02386f-f4cb-4b43-80fd-1e4124763902",
        name: "pif ",
        username: "pifafu",
        farcasterId: "5779",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        bio: "Head of Design @optimism 🌞 · grateful delegate in the game of Nouns • let’s take care of each other",
        email: "pifafu@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-05-23T15:32:21.894Z",
        updatedAt: "2024-07-31T16:42:57.795Z",
        deletedAt: null,
        object: "user",
        fid: 5779,
        custody_address: "0xa0ee62200453ed18d7a9a16af5fda9833edcf132",
        display_name: "pif ",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/43fc6f4f-101d-46bc-0431-7828250a3a00/rectcrop3",
        profile: {
          bio: {
            text: "design stuff @optimism 🌞 · grateful delegate in the game of Nouns",
          },
        },
        follower_count: 444,
        following_count: 106,
        verifications: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
        verified_addresses: {
          eth_addresses: ["0xe30acddc6782d82c0cbe00349c27cb4e78c51510"],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
      {
        id: "8f2c874e-c6b6-4f2d-b19d-0f7ea647292c",
        name: "Shaun",
        username: "shaun-testing-2",
        farcasterId: "844381",
        imageUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        bio: "I’m a friend, designer, and optimist.",
        email: "shaun@optimism.io",
        emailVerified: false,
        github: null,
        notDeveloper: false,
        createdAt: "2024-08-26T18:31:46.057Z",
        updatedAt: "2024-08-26T19:24:26.877Z",
        deletedAt: null,
        object: "user",
        fid: 844381,
        custody_address: "0x669ba2fda182152f493d21eff990425e2cf118e3",
        display_name: "Shaun",
        pfp_url:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fcabf5a2-4e9f-49e4-8b61-79f8a7a04500/rectcrop3",
        profile: {
          bio: {
            text: "I’m a friend, designer, and optimist.",
          },
        },
        follower_count: 0,
        following_count: 5,
        verifications: [],
        verified_addresses: {
          eth_addresses: [],
          sol_addresses: [],
        },
        active_status: "inactive",
        power_badge: false,
      },
    ],
    github: [
      {
        "https://github.com/iotchain/contracts": {
          repo_rank: 2,
          star_count: 100,
          starred_events: 104,
          starred_by_top_devs: 24,
          fork_count: 14,
          forked_events: 17,
          forked_by_top_devs: 5,
          fulltime_developer_average_6_months: 0.03,
          new_contributor_count_6_months: 10,
          age_of_project_years: 1.5,
        },
      },
    ],
    packages: [],
    contracts: [
      {
        address: "0xC8d9e0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
        deploymentTxHash: "0xb3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8a9d0e1f2",
        deployerAddress: "0x74D7eF6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
        chainId: 42161,
      },
    ],
    grantsAndFunding: {
      ventureFunding: [
        {
          amount: "2m-3m",
          year: "2022",
          details: "Series A funding led by IoT Ventures.",
        },
      ],
      grants: [
        {
          grant: "technology-grant",
          link: "https://iotchain.io/grant",
          amount: "900000",
          date: "2022-11-15",
          details: "Grant awarded for developing secure IoT devices.",
        },
      ],
      revenue: [
        {
          amount: "1.5m-2m",
          details:
            "Revenue from device integration services and platform fees.",
        },
      ],
    },
    organization: null,
    links: ["https://iotblock.com/iotchain", "https://techiot.com/iotchain"],
    impactStatement: [
      {
        question:
          "How has the infrastructure you built enabled the testing, deployment, and operation of OP chains?",
        answer:
          "The PixelVerse platform has been instrumental in enabling the testing, deployment, and operation of OP chains by providing a secure and scalable environment for creators and collectors to interact with NFTs. Our infrastructure supports the creation, minting, and trading of NFTs, as well as the development of decentralized applications and smart contracts. By leveraging blockchain technology, we have created a vibrant ecosystem that empowers users to explore, create, and exchange digital assets in a decentralized and transparent manner.",
      },
      {
        question: "Who has used your tooling and how has it benefited them?",
        answer:
          "Our tooling has been used by a diverse range of users, including artists, developers, collectors, and investors. Artists have leveraged our platform to create and showcase their digital artwork, while developers have utilized our APIs and SDKs to build custom applications and integrations. Collectors and investors have benefited from our marketplace, which provides a seamless and secure environment for buying, selling, and trading NFTs. By offering a user-friendly interface, robust security features, and low transaction fees, we have enabled users to engage with the PixelVerse ecosystem in a meaningful and rewarding way.",
      },
    ],
    pricingModel: {
      model: "freemium",
      details:
        "Our platform follows a freemium pricing model, offering basic features for free and premium features for a subscription fee. Users can access core functionality, such as creating and minting NFTs, for no cost, while advanced features, such as analytics and marketing tools, are available through a paid subscription. By providing a tiered pricing structure, we cater to users with varying needs and budgets, ensuring that everyone can participate in the PixelVerse ecosystem.",
    },
  },
];

async function main() {
  // const result = projectIds.map((id) => {
  //   const project = projects.find((proj) => proj.project_id === id);
  //   return {
  //     project_id: id,
  //     project_name: project ? project.displayName : formatProjectName(id),
  //     profileImageUrl:
  //       project && project.profile ? project.profile.profileImageUrl : "",
  //   };
  // });

  for (const project of projects) {
    await prisma.mockProjects.create({
      data: {
        id: project.id,
        category_slug: project.category_slug,
        name: project.name,
        description: project.description,
        profileAvatarUrl: project.profileAvatarUrl,
        projectCoverImageUrl: project.projectCoverImageUrl,
        socialLinks: project.socialLinks,
        team: project.team,
        github: project.github,
        packages: project.packages,
        contracts: project.contracts,
        grantsAndFunding: project.grantsAndFunding,
        organization: project.organization || {},
        links: project.links,
        impactStatement: {},
        pricingModel: {},
      },
    });
  }

  console.log("Projects data loaded successfully.");
}

main();
