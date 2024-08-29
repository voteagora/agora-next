import { fetchProposals } from "@/app/api/common/proposals/getProposals";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("getProposals integration tests for Optimism", () => {
  beforeAll(async () => {
    // Set the environment variable for the Optimism tenant
    process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME = "scroll";
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return Optimism proposals", async () => {
    const result = await fetchProposals({
      filter: "all",
      pagination: { offset: 0, limit: 10 },
    });

    expect(result.data).toHaveLength(2); // Update as per your Optimism data
  });
});
