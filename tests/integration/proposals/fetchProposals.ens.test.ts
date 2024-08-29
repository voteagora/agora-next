import { fetchProposals } from "@/app/api/common/proposals/getProposals";
import Tenant from "@/lib/tenant/tenant";
import {
  setupTestDatabase,
  teardownTestDatabase,
} from "../../orchestrator/testUtils";

describe("Fetch ENS Proposals", () => {
  beforeAll(async () => {
    await setupTestDatabase();
    Tenant.load();
  });

  it("should load ENS Proposals", async () => {
    const proposals = await fetchProposals({
      filter: "relevant",
      pagination: { limit: 10, offset: 0 },
    });

    const expectedProposer = "0x65a3870f48b5237f27f674ec42ea1e017e111d63";

    proposals.data.forEach((proposal) => {
      expect(proposal.proposer).toBeDefined();
    });
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });
});
