import { cache } from "react";
import { addressOrEnsNameWrap } from "../utils/ensName";
import { prismaWeb2Client } from "@/app/lib/web2";
import { fetchBallot } from "./getBallots";
import { autobalanceAllocations } from "./autobalance";
import { Prisma } from "@prisma/client";

type BallotContent = {
  category_slug: string;
  allocation: number;
  locked: boolean;
};

const updateBallotCategoryApi = async (
  data: BallotContent,
  roundId: number,
  badgeholderCategory: string,
  ballotCasterAddressOrEns: string
) =>
  addressOrEnsNameWrap(
    updateBallotCategoryForAddress,
    ballotCasterAddressOrEns,
    {
      data,
      roundId,
      badgeholderCategory,
    }
  );

async function updateBallotCategoryForAddress({
  data,
  roundId,
  badgeholderCategory,
  address,
}: {
  data: BallotContent;
  roundId: number;
  badgeholderCategory: string;
  address: string;
}) {
  // Create ballot if it doesn't exist
  await prismaWeb2Client.ballots.upsert({
    where: {
      address_round: {
        address,
        round: roundId,
      },
    },
    update: {
      updated_at: new Date(),
    },
    create: {
      round: roundId,
      address,
    },
  });

  // Add or update allocation
  await prismaWeb2Client.categoryAllocations.upsert({
    where: {
      address_round_category_slug: {
        category_slug: data.category_slug,
        round: roundId,
        address,
      },
    },
    update: {
      allocation: data.allocation,
      locked: data.locked,
      updated_at: new Date(),
    },
    create: {
      category_slug: data.category_slug,
      round: roundId,
      address,
      allocation: data.allocation,
      locked: data.locked,
    },
  });

  await autobalanceCategories(address, roundId, data.category_slug);

  // Return full ballot
  return fetchBallot(roundId, address, badgeholderCategory);
}

async function autobalanceCategories(
  address: string,
  roundId: number,
  categoryToSkip: string
) {
  const [curAllocations, categories] = await Promise.all([
    prismaWeb2Client.categoryAllocations.findMany({
      where: {
        address,
        round: roundId,
      },
    }),
    prismaWeb2Client.categories.findMany({
      where: {
        round: roundId,
      },
    }),
  ]);

  const allocations = categories.map((category) => {
    const curAllocation = curAllocations.find(
      (a) => a.category_slug === category.slug
    );
    return {
      id: category.slug,
      allocation: curAllocation?.allocation || new Prisma.Decimal(0),
      locked: curAllocation?.locked || false,
    };
  });

  const autobalancedAllocations = autobalanceAllocations({
    allocations,
    idToSkip: categoryToSkip,
  });

  await Promise.all(
    autobalancedAllocations.map(async (allocation) => {
      await prismaWeb2Client.categoryAllocations.upsert({
        where: {
          address_round_category_slug: {
            category_slug: allocation.id,
            address,
            round: roundId,
          },
        },
        update: {
          allocation: allocation.allocation,
        },
        create: {
          category_slug: allocation.id,
          round: roundId,
          address,
          allocation: allocation.allocation,
          locked: allocation.locked,
        },
      });
    })
  );
}

export const updateBallotCategory = cache(updateBallotCategoryApi);
