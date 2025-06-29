/**
 * Comprehensive test suite to verify calculation parity between old and new systems
 */

import { ProposalAdapter } from "@/domain/proposals/adapters/ProposalAdapter";
import { parseProposal, calculateMetrics } from "@/lib/proposalUtils"; // Existing functions
import { TENANT_NAMESPACES } from "@/lib/types";

// Test data sets covering edge cases
const TEST_CASES = {
  standard: [
    {
      name: "Standard proposal - basic case",
      data: {
        proposal_id: "1",
        proposal_type: "STANDARD",
        proposer: "0x123",
        description: "Test proposal",
        proposal_data: {
          targets: ["0xabc"],
          values: ["0"],
          signatures: ["test()"],
          calldatas: ["0x"],
        },
        proposal_results: {
          for_votes: "30000",
          against_votes: "15000", 
          abstain_votes: "5000",
        },
        created_block: "1000",
        start_block: "1100",
        end_block: "1200",
        quorum_votes: "40000",
        approval_threshold: "5000", // 50%
      },
      votableSupply: 1000000n,
      tenant: TENANT_NAMESPACES.OPTIMISM,
    },
    {
      name: "Standard proposal - no votes",
      data: {
        proposal_id: "2",
        proposal_type: "STANDARD",
        proposer: "0x123",
        description: "Test proposal",
        proposal_data: {
          targets: ["0xabc"],
          values: ["0"],
          signatures: ["test()"],
          calldatas: ["0x"],
        },
        proposal_results: {
          for_votes: "0",
          against_votes: "0",
          abstain_votes: "0",
        },
        created_block: "1000",
        start_block: "1100", 
        end_block: "1200",
        quorum_votes: "40000",
        approval_threshold: "5000",
      },
      votableSupply: 1000000n,
      tenant: TENANT_NAMESPACES.OPTIMISM,
    },
    {
      name: "Standard proposal - only abstain (SCROLL)",
      data: {
        proposal_id: "3",
        proposal_type: "STANDARD",
        proposer: "0x123",
        description: "Test proposal", 
        proposal_data: {
          targets: ["0xabc"],
          values: ["0"],
          signatures: ["test()"],
          calldatas: ["0x"],
        },
        proposal_results: {
          for_votes: "0",
          against_votes: "0",
          abstain_votes: "50000",
        },
        created_block: "1000",
        start_block: "1100",
        end_block: "1200",
        quorum_votes: "40000", 
        approval_threshold: "5000",
      },
      votableSupply: 1000000n,
      tenant: TENANT_NAMESPACES.SCROLL, // All votes count for quorum
    },
  ],

  optimistic: [
    {
      name: "Optimistic - not vetoed",
      data: {
        proposal_id: "4",
        proposal_type: "OPTIMISTIC",
        proposer: "0x123",
        description: "Test optimistic proposal",
        proposal_data: {
          targets: ["0xabc"],
          values: ["0"],
          signatures: ["test()"],
          calldatas: ["0x"],
        },
        proposal_results: {
          for_votes: "5000",
          against_votes: "100000", // 10% of supply
          abstain_votes: "10000",
        },
        created_block: "1000",
        start_block: "1100",
        end_block: "1200",
      },
      votableSupply: 1000000n,
      tenant: TENANT_NAMESPACES.OPTIMISM,
      expectedStatus: "SUCCEEDED", // 10% < 12% threshold
    },
    {
      name: "Optimistic - vetoed",
      data: {
        proposal_id: "5", 
        proposal_type: "OPTIMISTIC",
        proposer: "0x123",
        description: "Test optimistic proposal",
        proposal_data: {
          targets: ["0xabc"],
          values: ["0"],
          signatures: ["test()"],
          calldatas: ["0x"],
        },
        proposal_results: {
          for_votes: "5000",
          against_votes: "600000", // 60% of supply (exceeds both 12% and 50%)
          abstain_votes: "10000",
        },
        created_block: "1000",
        start_block: "1100", 
        end_block: "1200",
      },
      votableSupply: 1000000n,
      tenant: TENANT_NAMESPACES.OPTIMISM,
      expectedStatus: "DEFEATED",
    },
  ],

  approval: [
    {
      name: "Approval - TOP_CHOICES",
      data: {
        proposal_id: "6",
        proposal_type: "APPROVAL", 
        proposer: "0x123",
        description: "Test approval proposal",
        proposal_data: {
          options: [
            {
              title: "Option A",
              transactions: [
                {
                  type: "TRANSFER",
                  target: "0xabc",
                  value: "0",
                  calldata: "0x",
                  amount: "30000"
                }
              ]
            },
            {
              title: "Option B", 
              transactions: [
                {
                  type: "TRANSFER",
                  target: "0xdef",
                  value: "0", 
                  calldata: "0x",
                  amount: "25000"
                }
              ]
            },
            {
              title: "Option C",
              transactions: [
                {
                  type: "TRANSFER",
                  target: "0xghi",
                  value: "0",
                  calldata: "0x", 
                  amount: "20000"
                }
              ]
            }
          ],
          maxApprovals: 3,
          criteria: "TOP_CHOICES",
          criteriaValue: 2,
          budgetToken: "0xtoken",
          budgetAmount: "100000"
        },
        proposal_results: {
          "Option A": "20000",
          "Option B": "15000", 
          "Option C": "10000",
        },
        created_block: "1000",
        start_block: "1100",
        end_block: "1200",
        quorum_votes: "40000",
      },
      votableSupply: 1000000n,
      tenant: TENANT_NAMESPACES.OPTIMISM,
    },
  ],

  hybrid: [
    {
      name: "Hybrid Standard - all groups participating",
      data: {
        proposal_id: "7",
        proposal_type: "HYBRID_STANDARD",
        proposer: "0x123", 
        description: "Test hybrid proposal",
        proposal_data: {
          onchain: {
            targets: ["0xabc"],
            values: ["0"],
            signatures: ["test()"],
            calldatas: ["0x"],
          },
          offchain: {},
        },
        proposal_results: {
          kind: "HYBRID_STANDARD",
          DELEGATES: {
            for: "10000",
            against: "5000", 
            abstain: "2000"
          },
          APPS: {
            for: "150",
            against: "50",
            abstain: "20"
          },
          USERS: {
            for: "2000", 
            against: "1000",
            abstain: "200"
          },
          CHAINS: {
            for: "20",
            against: "5",
            abstain: "2"
          }
        },
        created_block: "1000",
        start_block: "1100",
        end_block: "1200",
        quorum_votes: "40000",
      },
      votableSupply: 1000000n, 
      delegateQuorum: 100000n, // 30% of delegate supply
      tenant: TENANT_NAMESPACES.OPTIMISM,
    },
  ],

  hybridOptimistic: [
    {
      name: "Hybrid Optimistic Tiered - not vetoed",
      data: {
        proposal_id: "8",
        proposal_type: "HYBRID_OPTIMISTIC_TIERED",
        proposer: "0x123",
        description: "Test hybrid optimistic proposal",
        proposal_data: {
          onchain: {
            targets: ["0xabc"],
            values: ["0"],
            signatures: ["test()"],
            calldatas: ["0x"],
          },
          offchain: {},
          tiers: [55, 45, 35], // Thresholds for 2, 3, 4 groups
        },
        proposal_results: {
          kind: "HYBRID_OPTIMISTIC_TIERED",
          DELEGATES: {
            for: "1000",
            against: "30000", // 30% against
            abstain: "1000"
          },
          APPS: {
            for: "50", 
            against: "40", // 40% against
            abstain: "10"
          },
          USERS: {
            for: "500",
            against: "400", // 40% against
            abstain: "100"
          },
          CHAINS: {
            for: "10",
            against: "8", // 40% against
            abstain: "2"
          }
        },
        created_block: "1000",
        start_block: "1100",
        end_block: "1200",
      },
      votableSupply: 1000000n,
      delegateQuorum: 100000n,
      tenant: TENANT_NAMESPACES.OPTIMISM,
      expectedStatus: "DEFEATED", // 4 groups > 35% threshold
    },
  ],
};

describe("Calculation Verification", () => {
  beforeAll(() => {
    // Initialize new system
    ProposalAdapter.initialize();
  });

  describe("Standard Proposals", () => {
    TEST_CASES.standard.forEach(testCase => {
      test(testCase.name, async () => {
        await verifyCalculations(testCase);
      });
    });
  });

  describe("Optimistic Proposals", () => {
    TEST_CASES.optimistic.forEach(testCase => {
      test(testCase.name, async () => {
        await verifyCalculations(testCase);
      });
    });
  });

  describe("Approval Proposals", () => {
    TEST_CASES.approval.forEach(testCase => {
      test(testCase.name, async () => {
        await verifyCalculations(testCase);
      });
    });
  });

  describe("Hybrid Proposals", () => {
    TEST_CASES.hybrid.forEach(testCase => {
      test(testCase.name, async () => {
        await verifyCalculations(testCase);
      });
    });
  });

  describe("Hybrid Optimistic Proposals", () => {
    TEST_CASES.hybridOptimistic.forEach(testCase => {
      test(testCase.name, async () => {
        await verifyCalculations(testCase);
      });
    });
  });
});

async function verifyCalculations(testCase: any) {
  const { data, votableSupply, tenant, expectedStatus } = testCase;

  try {
    // OLD SYSTEM
    const oldParsed = parseProposal(data, tenant);
    const oldMetrics = calculateMetrics(oldParsed, votableSupply);
    const oldStatus = getProposalStatus(oldParsed); // From existing utils

    // NEW SYSTEM  
    const proposal = ProposalAdapter.toDomainModel(data, votableSupply);
    const newMetrics = proposal.getMetrics();
    const newStatus = proposal.getStatus();

    // VERIFY METRICS
    console.log(`\nTesting: ${testCase.name}`);
    console.log("Old metrics:", oldMetrics);
    console.log("New metrics:", newMetrics);
    console.log("Old status:", oldStatus);
    console.log("New status:", newStatus);

    // Core metrics should match within tolerance
    if (oldMetrics.participationRate !== undefined) {
      expect(newMetrics.participationRate).toBeCloseTo(oldMetrics.participationRate, 1);
    }

    if (oldMetrics.approvalRate !== undefined) {
      expect(newMetrics.approvalRate).toBeCloseTo(oldMetrics.approvalRate, 1);
    }

    expect(newMetrics.quorumMet).toBe(oldMetrics.quorumMet);
    expect(newMetrics.approvalMet).toBe(oldMetrics.approvalMet);

    // Status should match (unless we know there's an inconsistency)
    if (expectedStatus) {
      expect(newStatus).toBe(expectedStatus);
    } else {
      expect(newStatus).toBe(oldStatus);
    }

    // TYPE-SPECIFIC VERIFICATIONS
    if (data.proposal_type === "OPTIMISTIC") {
      const oldOptimisticMetrics = oldMetrics as any;
      const newOptimisticMetrics = newMetrics as any;
      
      if (oldOptimisticMetrics.vetoProgress !== undefined) {
        expect(newOptimisticMetrics.vetoProgress).toBeCloseTo(oldOptimisticMetrics.vetoProgress, 1);
      }
      
      expect(newOptimisticMetrics.isVetoed).toBe(oldOptimisticMetrics.isVetoed);
    }

    if (data.proposal_type.includes("APPROVAL")) {
      const oldApprovalMetrics = oldMetrics as any;
      const newApprovalMetrics = newMetrics as any;
      
      if (oldApprovalMetrics.topOptions) {
        expect(newApprovalMetrics.topOptions).toEqual(oldApprovalMetrics.topOptions);
      }
      
      if (oldApprovalMetrics.budgetUtilization !== undefined) {
        expect(newApprovalMetrics.budgetUtilization).toBeCloseTo(oldApprovalMetrics.budgetUtilization, 1);
      }
    }

    if (data.proposal_type.includes("HYBRID")) {
      const oldHybridMetrics = oldMetrics as any;
      const newHybridMetrics = newMetrics as any;
      
      if (oldHybridMetrics.weightedApprovalRate !== undefined) {
        expect(newHybridMetrics.weightedApprovalRate).toBeCloseTo(oldHybridMetrics.weightedApprovalRate, 1);
      }
      
      // Verify group metrics
      if (oldHybridMetrics.groupMetrics && newHybridMetrics.groupMetrics) {
        for (const group of ['delegates', 'apps', 'users', 'chains']) {
          if (oldHybridMetrics.groupMetrics[group] && newHybridMetrics.groupMetrics[group]) {
            expect(newHybridMetrics.groupMetrics[group].participationRate)
              .toBeCloseTo(oldHybridMetrics.groupMetrics[group].participationRate, 1);
            expect(newHybridMetrics.groupMetrics[group].approvalRate)
              .toBeCloseTo(oldHybridMetrics.groupMetrics[group].approvalRate, 1);
          }
        }
      }
    }

  } catch (error) {
    console.error(`Verification failed for ${testCase.name}:`, error);
    throw error;
  }
}

// Additional edge case tests
describe("Edge Cases", () => {
  test("Division by zero handling", () => {
    const testData = {
      proposal_id: "edge1",
      proposal_type: "STANDARD",
      proposer: "0x123",
      description: "Zero votes test",
      proposal_data: {
        targets: ["0xabc"],
        values: ["0"],
        signatures: ["test()"],
        calldatas: ["0x"],
      },
      proposal_results: {
        for_votes: "0",
        against_votes: "0", 
        abstain_votes: "0",
      },
      created_block: "1000",
      start_block: "1100",
      end_block: "1200",
      quorum_votes: "40000",
      approval_threshold: "5000",
    };

    const proposal = ProposalAdapter.toDomainModel(testData, 1000000n);
    const metrics = proposal.getMetrics();

    expect(metrics.approvalRate).toBe(0);
    expect(metrics.participationRate).toBe(0);
    expect(metrics.quorumMet).toBe(false);
    expect(metrics.approvalMet).toBe(false);
  });

  test("Large number handling", () => {
    const testData = {
      proposal_id: "edge2",
      proposal_type: "STANDARD", 
      proposer: "0x123",
      description: "Large numbers test",
      proposal_data: {
        targets: ["0xabc"],
        values: ["0"],
        signatures: ["test()"],
        calldatas: ["0x"],
      },
      proposal_results: {
        for_votes: "999999999999999999999999", // Very large number
        against_votes: "1",
        abstain_votes: "0",
      },
      created_block: "1000",
      start_block: "1100", 
      end_block: "1200",
      quorum_votes: "1000",
      approval_threshold: "5000",
    };

    expect(() => {
      const proposal = ProposalAdapter.toDomainModel(testData, BigInt("1000000000000000000000000"));
      const metrics = proposal.getMetrics();
    }).not.toThrow();
  });
});