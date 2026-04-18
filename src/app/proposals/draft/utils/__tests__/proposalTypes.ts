import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { getProposalTypeMetaDataForTenant } from "../proposalTypes";
import {
  DraftVotingModuleType,
  type TenantProposalTypeConfig,
} from "../../types";
import Tenant from "@/lib/tenant/tenant";

// Store the original Tenant.current implementation
const originalTenantCurrent = Tenant.current;

// Helper function to mock Tenant with specific proposal types
const mockTenantWithProposalTypes = (
  proposalTypes: TenantProposalTypeConfig[] = []
) => {
  Tenant.current = vi.fn().mockReturnValue({
    ui: {
      toggle: vi.fn().mockImplementation((name: string) => ({
        name: "proposal-lifecycle",
        enabled: true,
        config: {
          proposalTypes,
        },
      })),
    },
  });
};

describe("getProposalTypeMetaDataForTenant", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    Tenant.current = originalTenantCurrent;
  });

  test("should return empty array when no proposal types are provided", () => {
    mockTenantWithProposalTypes([
      {
        type: DraftVotingModuleType.BASIC,
        prodAddress: null,
        testnetAddress: null,
      },
      {
        type: DraftVotingModuleType.APPROVAL,
        prodAddress: null,
        testnetAddress: null,
      },
      {
        type: DraftVotingModuleType.OPTIMISTIC,
        prodAddress: null,
        testnetAddress: null,
      },
    ]);

    const result = getProposalTypeMetaDataForTenant([]);
    expect(result).toEqual([]);
  });

  test("should return only proposal types that are enabled in the tenant config", () => {
    mockTenantWithProposalTypes([
      {
        type: DraftVotingModuleType.BASIC,
        prodAddress: null,
        testnetAddress: null,
      },
      {
        type: DraftVotingModuleType.APPROVAL,
        prodAddress: null,
        testnetAddress: null,
      },
    ]);

    const proposalTypes = [
      {
        id: "0x123|0",
        name: "Regular Proposal",
        proposal_type_id: "0",
      },
      {
        id: "0x123|1",
        name: "Approval Proposal",
        proposal_type_id: "1",
      },
      {
        id: "0x123|2",
        name: "Optimistic Proposal",
        proposal_type_id: "2",
      },
    ];

    const result = getProposalTypeMetaDataForTenant(proposalTypes);

    expect(result).toContain("basic");
    expect(result).toContain("approval");
    expect(result).not.toContain("optimistic");
    expect(result.length).toBe(2);
  });

  test("should correctly categorize proposal types based on their names", () => {
    mockTenantWithProposalTypes([
      {
        type: DraftVotingModuleType.BASIC,
        prodAddress: null,
        testnetAddress: null,
      },
      {
        type: DraftVotingModuleType.APPROVAL,
        prodAddress: null,
        testnetAddress: null,
      },
      {
        type: DraftVotingModuleType.OPTIMISTIC,
        prodAddress: null,
        testnetAddress: null,
      },
    ]);

    const proposalTypes = [
      {
        id: "0x123|0",
        name: "Treasury transfers",
        proposal_type_id: "0",
      },
      {
        id: "0x123|1",
        name: "Approval Voting",
        proposal_type_id: "1",
      },
      {
        id: "0x123|2",
        name: "Optimistic Governance",
        proposal_type_id: "2",
      },
    ];

    const result = getProposalTypeMetaDataForTenant(proposalTypes);

    // Should include all three types
    expect(result).toContain("basic");
    expect(result).toContain("approval");
    expect(result).toContain("optimistic");
    expect(result.length).toBe(3);
  });

  test("should handle case when tenant config has no proposal types", () => {
    mockTenantWithProposalTypes([]);

    const proposalTypes = [
      {
        id: "0x123|0",
        name: "Regular Proposal",
        proposal_type_id: "0",
      },
    ];

    const result = getProposalTypeMetaDataForTenant(proposalTypes);

    // Should return empty array since no types are enabled in config
    expect(result).toEqual([]);
  });

  test("should handle case when toggle or config is undefined", () => {
    // Mock Tenant.current with undefined toggle
    Tenant.current = vi.fn().mockReturnValue({
      ui: {
        toggle: vi.fn().mockReturnValue(undefined),
      },
    });

    const proposalTypes = [
      {
        id: "0x123|0",
        name: "Regular Proposal",
        proposal_type_id: "0",
      },
    ];

    const result = getProposalTypeMetaDataForTenant(proposalTypes);

    // Should return empty array since config is undefined
    expect(result).toEqual([]);
  });

  test("should be case-insensitive when matching proposal types", () => {
    mockTenantWithProposalTypes([
      {
        type: DraftVotingModuleType.BASIC,
        prodAddress: null,
        testnetAddress: null,
      },
      {
        type: DraftVotingModuleType.APPROVAL,
        prodAddress: null,
        testnetAddress: null,
      },
    ]);

    const proposalTypes = [
      {
        id: "0x123|0",
        name: "regular proposal", // lowercase
        proposal_type_id: "0",
      },
      {
        id: "0x123|1",
        name: "APPROVAL VOTING", // uppercase
        proposal_type_id: "1",
      },
    ];

    const result = getProposalTypeMetaDataForTenant(proposalTypes);

    expect(result).toContain("basic");
    expect(result).toContain("approval");
    expect(result.length).toBe(2);
  });

  test("should handle if more proposal types are provided than config types", () => {
    mockTenantWithProposalTypes([
      {
        type: DraftVotingModuleType.BASIC,
        prodAddress: null,
        testnetAddress: null,
      },
    ]);

    const proposalTypes = [
      {
        id: "0x123|0",
        name: "Regular Proposal",
        proposal_type_id: "0",
      },
      {
        id: "0x123|1",
        name: "Approval Proposal",
        proposal_type_id: "1",
      },
      {
        id: "0x123|2",
        name: "Optimistic Proposal",
        proposal_type_id: "2",
      },
    ];

    const result = getProposalTypeMetaDataForTenant(proposalTypes);

    expect(result).toContain("basic");
    expect(result).not.toContain("approval");
    expect(result).not.toContain("optimistic");
    expect(result.length).toBe(1);
  });
});
