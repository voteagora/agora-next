import { fetchProposals } from "@/app/api/common/proposals/getProposals";
import Tenant from "@/lib/tenant/tenant";
import {
  setupTestDatabase,
  teardownTestDatabase,
} from "../../orchestrator/testUtils";

describe("Fetch Optimism Proposals", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    Tenant.load();
  });

  it("should load Optimism Proposals", async () => {
    const proposals = await fetchProposals({
      filter: "relevant",
      pagination: { limit: 10, offset: 0 },
    });

    const expectedProposer = "0xe538f6f407937ffdee9b2704f9096c31c64e63a8";

    proposals.data.forEach((proposal) => {
      expect(proposal.proposer).toEqual(expectedProposer);
    });
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });
});
