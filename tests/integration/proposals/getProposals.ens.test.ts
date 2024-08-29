import { fetchProposals } from "@/app/api/common/proposals/getProposals";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("getProposals integration tests for ENS", () => {
  beforeAll(async () => {
    // Set the environment variable for the ENS tenant
    process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME = "ens";
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return ENS proposals", async () => {
    const result = await fetchProposals({
      filter: "all",
      pagination: { offset: 0, limit: 10 },
    });

    expect(result.data).toHaveLength(2); // Update as per your ENS data
  });
});
