// import { Ballot } from "./ballot";
import { Ballot } from "./ballot";
import { calculateAllocations } from "./ballotAllocations";
import { expect } from "@jest/globals";

const ballot = [
  {
    address: "0xa18d0226043a76683950f3baabf0a87cfb32e1cb",
    round: 4,
    status: "SUBMITTED",
    os_only: false,
    os_multiplier: 2.6,
    metric_id: "monthly_active_addresses",
    allocation: 30,
    locked: true,
    allocations:
      '[{"project_id" : "d-hedge", "name" : "Foo Link", "image" : "", "is_os" : true, "value" : 951.8518519}, {"project_id" : "hypercerts", "name" : "Bar Forge", "image" : "", "is_os" : false, "value" : 17903.46}, {"project_id" : "synapse", "name" : "Imaginary Pulse", "image" : "", "is_os" : false, "value" : 74418.4}, {"project_id" : "hop-protocol", "name" : "Not Real Network", "image" : "", "is_os" : false, "value" : 0.1234567901}, {"project_id" : "ethereum-attestation-service", "name" : "Test Protocol", "image" : "", "is_os" : false, "value" : 13628.15}, {"project_id" : "velodrome", "name" : "Fake Finance", "image" : "", "is_os" : true, "value" : 12.83950617}, {"project_id" : "galxe", "name" : "Imaginary Vault", "image" : "", "is_os" : false, "value" : 1669.14}, {"project_id" : "tarot-finance", "name" : "Fake Gateway", "image" : "", "is_os" : false, "value" : 8155.31}, {"project_id" : "slingshot", "name" : "Foo Swap", "image" : "", "is_os" : false, "value" : 80.74074074}, {"project_id" : "layer3xyz", "name" : "Bar Path", "image" : "", "is_os" : false, "value" : 10.86419753}, {"project_id" : "aave", "name" : "Test Mesh", "image" : "", "is_os" : false, "value" : 55.67901235}, {"project_id" : "wormhole", "name" : "Fake Dex", "image" : "", "is_os" : false, "value" : 5.308641975}, {"project_id" : "connext", "name" : "Imaginary Network", "image" : "", "is_os" : false, "value" : 199.382716}, {"project_id" : "rainbow", "name" : "Not Real Finance", "image" : "", "is_os" : false, "value" : 0.7407407407}, {"project_id" : "extra-finance", "name" : "Foo Chain", "image" : "", "is_os" : true, "value" : 9759.75}, {"project_id" : "angle-protocol", "name" : "Imaginary Grid", "image" : "", "is_os" : true, "value" : 1.851851852}, {"project_id" : "quest-3", "name" : "Fake Protocol", "image" : "", "is_os" : true, "value" : 1.728395062}, {"project_id" : "uniswap", "name" : "Matrix Swap", "image" : "", "is_os" : false, "value" : 5.432098765}, {"project_id" : "synthetix", "name" : "Echo Finance", "image" : "", "is_os" : false, "value" : 0.8641975309}, {"project_id" : "woonetwork", "name" : "Radiant Path", "image" : "", "is_os" : false, "value" : 1.604938272}, {"project_id" : "pheasant-network", "name" : "Synergy Vault", "image" : "", "is_os" : false, "value" : 215.9259259}, {"project_id" : "beefy-finance", "name" : "Photon Network", "image" : "", "is_os" : false, "value" : 380.0}, {"project_id" : "debridge-finance", "name" : "Fusion Swap", "image" : "", "is_os" : false, "value" : 0.987654321}, {"project_id" : "zerion", "name" : "Terra Finance", "image" : "", "is_os" : true, "value" : 3.456790123}, {"project_id" : "rabbithole", "name" : "Cosmic Mesh", "image" : "", "is_os" : false, "value" : 21733.46}, {"project_id" : "granary", "name" : "Polaris Protocol", "image" : "", "is_os" : false, "value" : 5.308641975}, {"project_id" : "voteagora", "name" : "Elemental Dex", "image" : "", "is_os" : false, "value" : 4.691358025}, {"project_id" : "kwenta", "name" : "Pulse Network", "image" : "", "is_os" : false, "value" : 4447.9}, {"project_id" : "zeroex", "name" : "Quantum Swap", "image" : "", "is_os" : false, "value" : 1520.49}, {"project_id" : "metamask", "name" : "Paragon Chain", "image" : "", "is_os" : false, "value" : 53.95061728}, {"project_id" : "qidao-mai-finance", "name" : "Delta Finance", "image" : "", "is_os" : false, "value" : 2281.6}, {"project_id" : "kiwi-news-attestate", "name" : "Vertex Vault", "image" : "", "is_os" : false, "value" : 12664.57}, {"project_id" : "defi-llama", "name" : "Solstice Network", "image" : "", "is_os" : false, "value" : 1.728395062}, {"project_id" : "lido", "name" : "Aurora Finance", "image" : "", "is_os" : false, "value" : 6.296296296}, {"project_id" : "exactly", "name" : "Nova Swap", "image" : "", "is_os" : true, "value" : 3.580246914}, {"project_id" : "safe-global", "name" : "Eclipse Dex", "image" : "", "is_os" : false, "value" : 386.9135802}, {"project_id" : "fraxfinance", "name" : "Velocity Vault", "image" : "", "is_os" : false, "value" : 39.25925926}, {"project_id" : "superfluid", "name" : "Infinity Path", "image" : "", "is_os" : true, "value" : 16.54320988}, {"project_id" : "kyber-swap", "name" : "Prism Finance", "image" : "", "is_os" : true, "value" : 4370.0}, {"project_id" : "1-inch", "name" : "Cosmos Protocol", "image" : "", "is_os" : false, "value" : 244.8148148}, {"project_id" : "stargate-finance", "name" : "Luna Network", "image" : "", "is_os" : true, "value" : 0.6172839506}, {"project_id" : "giveth", "name" : "Vortex Dex", "image" : "", "is_os" : true, "value" : 2.592592593}, {"project_id" : "overnight", "name" : "Pulsar Finance", "image" : "", "is_os" : false, "value" : 2320.74}, {"project_id" : "thales", "name" : "Titan Path", "image" : "", "is_os" : false, "value" : 479.8765432}, {"project_id" : "paraswap", "name" : "Helios Vault", "image" : "", "is_os" : true, "value" : 5.185185185}, {"project_id" : "sonne-finance", "name" : "Nebula Protocol", "image" : "", "is_os" : true, "value" : 1074.57}, {"project_id" : "metronome-autonomoussoftware", "name" : "Aether Swap", "image" : "", "is_os" : true, "value" : 19760.25}, {"project_id" : "gitcoin", "name" : "Orbit Finance", "image" : "", "is_os" : false, "value" : 62.71604938}, {"project_id" : "magpiexyz", "name" : "Gravity Protocol", "image" : "", "is_os" : false, "value" : 0.1234567901}, {"project_id" : "beethoven-x", "name" : "Stellar Chain", "image" : "", "is_os" : true, "value" : 3615.31}]',
  },
  {
    address: "0xa18d0226043a76683950f3baabf0a87cfb32e1cb",
    round: 4,
    status: "SUBMITTED",
    os_only: false,
    os_multiplier: 2.6,
    metric_id: "trusted_recurring_users",
    allocation: 50,
    locked: true,
    allocations:
      '[{"project_id" : "layer3xyz", "name" : "Bar Path", "image" : "", "is_os" : false, "value" : 4206}, {"project_id" : "stargate-finance", "name" : "Luna Network", "image" : "", "is_os" : true, "value" : 3870}, {"project_id" : "rabbithole", "name" : "Cosmic Mesh", "image" : "", "is_os" : false, "value" : 876}, {"project_id" : "velodrome", "name" : "Fake Finance", "image" : "", "is_os" : true, "value" : 689}, {"project_id" : "galxe", "name" : "Imaginary Vault", "image" : "", "is_os" : false, "value" : 634}, {"project_id" : "debridge-finance", "name" : "Fusion Swap", "image" : "", "is_os" : false, "value" : 591}, {"project_id" : "gitcoin", "name" : "Orbit Finance", "image" : "", "is_os" : false, "value" : 338}, {"project_id" : "woonetwork", "name" : "Radiant Path", "image" : "", "is_os" : false, "value" : 316}, {"project_id" : "metamask", "name" : "Paragon Chain", "image" : "", "is_os" : false, "value" : 305}, {"project_id" : "paraswap", "name" : "Helios Vault", "image" : "", "is_os" : true, "value" : 268}, {"project_id" : "1-inch", "name" : "Cosmos Protocol", "image" : "", "is_os" : false, "value" : 257}, {"project_id" : "zeroex", "name" : "Quantum Swap", "image" : "", "is_os" : false, "value" : 256}, {"project_id" : "zerion", "name" : "Terra Finance", "image" : "", "is_os" : true, "value" : 207}, {"project_id" : "extra-finance", "name" : "Foo Chain", "image" : "", "is_os" : true, "value" : 197}, {"project_id" : "voteagora", "name" : "Elemental Dex", "image" : "", "is_os" : false, "value" : 170}, {"project_id" : "kwenta", "name" : "Pulse Network", "image" : "", "is_os" : false, "value" : 150}, {"project_id" : "sonne-finance", "name" : "Nebula Protocol", "image" : "", "is_os" : true, "value" : 143}, {"project_id" : "rainbow", "name" : "Not Real Finance", "image" : "", "is_os" : false, "value" : 135}, {"project_id" : "uniswap", "name" : "Matrix Swap", "image" : "", "is_os" : false, "value" : 114}, {"project_id" : "beethoven-x", "name" : "Stellar Chain", "image" : "", "is_os" : true, "value" : 111}, {"project_id" : "thales", "name" : "Titan Path", "image" : "", "is_os" : false, "value" : 97}, {"project_id" : "slingshot", "name" : "Foo Swap", "image" : "", "is_os" : false, "value" : 81}, {"project_id" : "lido", "name" : "Aurora Finance", "image" : "", "is_os" : false, "value" : 64}, {"project_id" : "defi-llama", "name" : "Solstice Network", "image" : "", "is_os" : false, "value" : 55}, {"project_id" : "kyber-swap", "name" : "Prism Finance", "image" : "", "is_os" : true, "value" : 53}, {"project_id" : "synthetix", "name" : "Echo Finance", "image" : "", "is_os" : false, "value" : 52}, {"project_id" : "synapse", "name" : "Imaginary Pulse", "image" : "", "is_os" : false, "value" : 51}, {"project_id" : "safe-global", "name" : "Eclipse Dex", "image" : "", "is_os" : false, "value" : 48}, {"project_id" : "hop-protocol", "name" : "Not Real Network", "image" : "", "is_os" : false, "value" : 42}, {"project_id" : "connext", "name" : "Imaginary Network", "image" : "", "is_os" : false, "value" : 39}, {"project_id" : "quest-3", "name" : "Fake Protocol", "image" : "", "is_os" : true, "value" : 39}, {"project_id" : "magpiexyz", "name" : "Gravity Protocol", "image" : "", "is_os" : false, "value" : 32}, {"project_id" : "fraxfinance", "name" : "Velocity Vault", "image" : "", "is_os" : false, "value" : 30}, {"project_id" : "angle-protocol", "name" : "Imaginary Grid", "image" : "", "is_os" : true, "value" : 26}, {"project_id" : "overnight", "name" : "Pulsar Finance", "image" : "", "is_os" : false, "value" : 25}, {"project_id" : "tarot-finance", "name" : "Fake Gateway", "image" : "", "is_os" : false, "value" : 24}, {"project_id" : "exactly", "name" : "Nova Swap", "image" : "", "is_os" : true, "value" : 23}, {"project_id" : "beefy-finance", "name" : "Photon Network", "image" : "", "is_os" : false, "value" : 21}, {"project_id" : "wormhole", "name" : "Fake Dex", "image" : "", "is_os" : false, "value" : 20}, {"project_id" : "metronome-autonomoussoftware", "name" : "Aether Swap", "image" : "", "is_os" : true, "value" : 19}, {"project_id" : "giveth", "name" : "Vortex Dex", "image" : "", "is_os" : true, "value" : 16}, {"project_id" : "pheasant-network", "name" : "Synergy Vault", "image" : "", "is_os" : false, "value" : 15}, {"project_id" : "ethereum-attestation-service", "name" : "Test Protocol", "image" : "", "is_os" : false, "value" : 12}, {"project_id" : "granary", "name" : "Polaris Protocol", "image" : "", "is_os" : false, "value" : 11}, {"project_id" : "d-hedge", "name" : "Foo Link", "image" : "", "is_os" : true, "value" : 11}, {"project_id" : "kiwi-news-attestate", "name" : "Vertex Vault", "image" : "", "is_os" : false, "value" : 10}, {"project_id" : "superfluid", "name" : "Infinity Path", "image" : "", "is_os" : true, "value" : 9}, {"project_id" : "hypercerts", "name" : "Bar Forge", "image" : "", "is_os" : false, "value" : 8}, {"project_id" : "aave", "name" : "Test Mesh", "image" : "", "is_os" : false, "value" : 5}, {"project_id" : "qidao-mai-finance", "name" : "Delta Finance", "image" : "", "is_os" : false, "value" : 5}]',
  },
  {
    address: "0xa18d0226043a76683950f3baabf0a87cfb32e1cb",
    round: 4,
    status: "SUBMITTED",
    os_only: false,
    os_multiplier: 2.6,
    metric_id: "gas_fees",
    allocation: 20,
    locked: false,
    allocations:
      '[{"project_id" : "layer3xyz", "name" : "Bar Path", "image" : "", "is_os" : false, "value" : 33.26838209683011}, {"project_id" : "stargate-finance", "name" : "Luna Network", "image" : "", "is_os" : true, "value" : 92.50278275193416}, {"project_id" : "rabbithole", "name" : "Cosmic Mesh", "image" : "", "is_os" : false, "value" : 107.3303248396099}, {"project_id" : "velodrome", "name" : "Fake Finance", "image" : "", "is_os" : true, "value" : 44.33409965388495}, {"project_id" : "galxe", "name" : "Imaginary Vault", "image" : "", "is_os" : false, "value" : 9.622800434503533}, {"project_id" : "debridge-finance", "name" : "Fusion Swap", "image" : "", "is_os" : false, "value" : 19.37164329496136}, {"project_id" : "gitcoin", "name" : "Orbit Finance", "image" : "", "is_os" : false, "value" : 4.999441823256962}, {"project_id" : "woonetwork", "name" : "Radiant Path", "image" : "", "is_os" : false, "value" : 4.033567341656939}, {"project_id" : "metamask", "name" : "Paragon Chain", "image" : "", "is_os" : false, "value" : 34.70170875993641}, {"project_id" : "paraswap", "name" : "Helios Vault", "image" : "", "is_os" : true, "value" : 32.08177819809524}, {"project_id" : "1-inch", "name" : "Cosmos Protocol", "image" : "", "is_os" : false, "value" : 16.27985571225452}, {"project_id" : "zeroex", "name" : "Quantum Swap", "image" : "", "is_os" : false, "value" : 296.5848221740562}, {"project_id" : "zerion", "name" : "Terra Finance", "image" : "", "is_os" : true, "value" : 0.8411760608304800}, {"project_id" : "extra-finance", "name" : "Foo Chain", "image" : "", "is_os" : true, "value" : 36.44999312648610}, {"project_id" : "voteagora", "name" : "Elemental Dex", "image" : "", "is_os" : false, "value" : 2.802974876267690}, {"project_id" : "kwenta", "name" : "Pulse Network", "image" : "", "is_os" : false, "value" : 59.82334248931034}, {"project_id" : "sonne-finance", "name" : "Nebula Protocol", "image" : "", "is_os" : true, "value" : 5.566266377158506}, {"project_id" : "rainbow", "name" : "Not Real Finance", "image" : "", "is_os" : false, "value" : 1.652362193864397}, {"project_id" : "uniswap", "name" : "Matrix Swap", "image" : "", "is_os" : false, "value" : 52.25801134476327}, {"project_id" : "beethoven-x", "name" : "Stellar Chain", "image" : "", "is_os" : true, "value" : 24.13220618093522}, {"project_id" : "thales", "name" : "Titan Path", "image" : "", "is_os" : false, "value" : 74.37012379982826}, {"project_id" : "slingshot", "name" : "Foo Swap", "image" : "", "is_os" : false, "value" : 12.71003916361989}, {"project_id" : "lido", "name" : "Aurora Finance", "image" : "", "is_os" : false, "value" : 0.1426658245996406}, {"project_id" : "defi-llama", "name" : "Solstice Network", "image" : "", "is_os" : false, "value" : 0.7963779779563529}, {"project_id" : "kyber-swap", "name" : "Prism Finance", "image" : "", "is_os" : true, "value" : 5.066158680323587}, {"project_id" : "synthetix", "name" : "Echo Finance", "image" : "", "is_os" : false, "value" : 167.0753717196521}, {"project_id" : "synapse", "name" : "Imaginary Pulse", "image" : "", "is_os" : false, "value" : 6.164813911780865}, {"project_id" : "safe-global", "name" : "Eclipse Dex", "image" : "", "is_os" : false, "value" : 263.5898340138086}, {"project_id" : "hop-protocol", "name" : "Not Real Network", "image" : "", "is_os" : false, "value" : 0.6329372110788032}, {"project_id" : "connext", "name" : "Imaginary Network", "image" : "", "is_os" : false, "value" : 82.16428220133339}, {"project_id" : "quest-3", "name" : "Fake Protocol", "image" : "", "is_os" : true, "value" : 2.463342308968677}, {"project_id" : "magpiexyz", "name" : "Gravity Protocol", "image" : "", "is_os" : false, "value" : 3.620761199159272}, {"project_id" : "fraxfinance", "name" : "Velocity Vault", "image" : "", "is_os" : false, "value" : 2.114564707512012}, {"project_id" : "angle-protocol", "name" : "Imaginary Grid", "image" : "", "is_os" : true, "value" : 1.646168099448592}, {"project_id" : "overnight", "name" : "Pulsar Finance", "image" : "", "is_os" : false, "value" : 24.81596382095089}, {"project_id" : "tarot-finance", "name" : "Fake Gateway", "image" : "", "is_os" : false, "value" : 34.08401657734996}, {"project_id" : "exactly", "name" : "Nova Swap", "image" : "", "is_os" : true, "value" : 2.240815634152243}, {"project_id" : "beefy-finance", "name" : "Photon Network", "image" : "", "is_os" : false, "value" : 2.659130826474696}, {"project_id" : "wormhole", "name" : "Fake Dex", "image" : "", "is_os" : false, "value" : 5.952795027199211}, {"project_id" : "metronome-autonomoussoftware", "name" : "Aether Swap", "image" : "", "is_os" : true, "value" : 6.016486042638777}, {"project_id" : "giveth", "name" : "Vortex Dex", "image" : "", "is_os" : true, "value" : 0.1483914824032061}, {"project_id" : "pheasant-network", "name" : "Synergy Vault", "image" : "", "is_os" : false, "value" : 0.1167055965955079}, {"project_id" : "ethereum-attestation-service", "name" : "Test Protocol", "image" : "", "is_os" : false, "value" : 5.812705115002820}, {"project_id" : "granary", "name" : "Polaris Protocol", "image" : "", "is_os" : false, "value" : 0.2462396135315124}, {"project_id" : "d-hedge", "name" : "Foo Link", "image" : "", "is_os" : true, "value" : 2.115762959850541}, {"project_id" : "kiwi-news-attestate", "name" : "Vertex Vault", "image" : "", "is_os" : false, "value" : 0.01899428769173278}, {"project_id" : "superfluid", "name" : "Infinity Path", "image" : "", "is_os" : true, "value" : 1.044114932982177}, {"project_id" : "hypercerts", "name" : "Bar Forge", "image" : "", "is_os" : false, "value" : 0.7402302805272175}, {"project_id" : "aave", "name" : "Test Mesh", "image" : "", "is_os" : false, "value" : 1.577587331511961}, {"project_id" : "qidao-mai-finance", "name" : "Delta Finance", "image" : "", "is_os" : false, "value" : 1.067484722116142}]',
  },
];

describe("ballotAllocations", () => {
  it("should calcualte allocations", () => {
    const parsedBalot = ballot.map((b) => {
      return {
        ...b,
        status: b.status as Ballot["status"],
        allocations: JSON.parse(b.allocations) as Ballot["allocations"],
      };
    });

    const adjustedAllocations = calculateAllocations(parsedBalot);

    console.log(adjustedAllocations);

    expect(adjustedAllocations).toEqual({
      address: "0x123",
      round_id: 1,
      status: "SUBMITTED",
      allocations: [
        {
          metric_id: "metric1",
          allocation: 2000000,
          locked: false,
        },
        {
          metric_id: "metric2",
          allocation: 8000000,
          locked: false,
        },
      ],
      project_allocations: [
        {
          project_id: "0xabc",
          name: "Project 1",
          image: "image1",
          is_os: true,
          allocation: 50,
          allocation_per_metric: [
            {
              metric_id: "metric1",
              allocation: 20,
            },
            {
              metric_id: "metric2",
              allocation: 30,
            },
          ],
        },
        {
          project_id: "0xdef",
          name: "Project 2",
          image: "image2",
          is_os: false,
          allocation: 50,
          allocation_per_metric: [
            {
              metric_id: "metric1",
              allocation: 0,
            },
            {
              metric_id: "metric2",
              allocation: 50,
            },
          ],
        },
      ],
    });
  });
});
