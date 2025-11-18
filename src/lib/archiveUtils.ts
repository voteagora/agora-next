import { PaginatedResult } from "@/app/lib/pagination";
import { ArchiveListProposal } from "./types/archiveProposal";
import {
  getArchiveSlugAllProposals,
  getArchiveSlugForDaoNodeProposal,
  getArchiveSlugForEasOodaoProposal,
  getArchiveSlugForProposalNonVoters,
  getArchiveSlugForProposalVotes,
} from "./constants";

const withCacheBust = (url: string) => {
  const now = Math.floor(Date.now() / 1000);
  const rounded = now - (now % 15);
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${rounded}`;
};

/**
 * Parse NDJSON (Newline Delimited JSON) string to array of objects
 */
function parseNDJSON<T>(ndjsonString: string): T[] {
  const lines = ndjsonString
    .split("\n")
    .filter((line) => line.trim().length > 0);
  const parsed: T[] = [];

  for (let i = 0; i < lines.length; i++) {
    try {
      parsed.push(JSON.parse(lines[i]));
    } catch (error) {
      console.error(`Failed to parse NDJSON line ${i + 1}:`, error);
      // Skip malformed lines and continue
    }
  }

  return parsed;
}

/**
 * Fetch and parse proposals from GCS archive in NDJSON format
 */
// export async function fetchProposalsFromArchive(
//   namespace: string,
//   filter: string
// ): Promise<PaginatedResult<ArchiveListProposal[]>> {
//   try {
//     const archiveUrl = withCacheBust(getArchiveSlugAllProposals(namespace));
//     const response = await fetch(archiveUrl, {
//       cache: "no-store", // Disable caching for fresh data
//     });

//     if (response.status === 404) {
//       return {
//         meta: {
//           has_next: false,
//           total_returned: 0,
//           next_offset: 0,
//         },
//         data: [],
//       };
//     }

//     if (!response.ok) {
//       throw new Error(
//         `Failed to fetch archive data: ${response.status} ${response.statusText}`
//       );
//     }

//     const ndjsonText = await response.text();
//     const allProposals = parseNDJSON<ArchiveListProposal>(ndjsonText);

//     // Apply filter if needed
//     let filteredProposals = allProposals;
//     if (filter === "relevant") {
//       // Filter out cancelled/deleted proposals for "relevant" filter
//       filteredProposals = allProposals.filter(
//         (proposal) =>
//           !proposal.cancel_event &&
//           !proposal.delete_event &&
//           proposal.lifecycle_stage !== "CANCELLED"
//       );
//     } else if (filter === "temp-checks") {
//       filteredProposals = allProposals.filter((proposal) =>
//         proposal.tags?.includes("tempcheck")
//       );
//     }

//     return {
//       meta: {
//         has_next: false,
//         total_returned: filteredProposals.length,
//         next_offset: 0,
//       },
//       data: filteredProposals,
//     };
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : String(error);
//     if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
//       return {
//         meta: {
//           has_next: false,
//           total_returned: 0,
//           next_offset: 0,
//         },
//         data: [],
//       };
//     }
//     console.error("Error fetching proposals from archive:", error);
//     throw error;
//   }
// }
export async function fetchProposalsFromArchive(
  namespace: string,
  filter: string
): Promise<PaginatedResult<ArchiveListProposal[]>> {
  try {
    // TODO: Remove dummy data when real data is available
    // Dummy data for UI development
    const dummyProposals: ArchiveListProposal[] = [
      {
        id: "1",
        title: "Proposal to Increase Treasury Allocation",
        proposer: "0x1234567890123456789012345678901234567890",
        proposer_ens: "vitalik.eth",
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
        end_blocktime: Math.floor(Date.now() / 1000) + 86400 * 3, // 3 days from now
        start_block: 1000000,
        end_block: 1100000,
        lifecycle_stage: "ACTIVE",
        data_eng_properties: {
          liveness: "live",
          source: "dao_node",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "0": "5000000000000000000000", // against
            "1": "15000000000000000000000", // for
            "2": "2000000000000000000000", // abstain
          },
        },
        outcome: {
          "0x0000000000000000000000000000000000000000": {
            "0": "5000000000000000000000",
            "1": "15000000000000000000000",
            "2": "2000000000000000000000",
          },
        },
        proposal_type: 0,
        quorum: "10000000000000000000000",
        quorumVotes: "22000000000000000000000",
        votableSupply: "50000000000000000000000",
        approval_threshold: "5000", // 50%
        blocktime: Math.floor(Date.now() / 1000) - 86400 * 7,
        created_event: {
          block_number: "1000000",
          transaction_index: 0,
          log_index: 0,
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 7,
          transaction_hash:
            "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        },
      },
      {
        id: "2",
        title: "Temp Check: Community Feedback on New Feature",
        proposer: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
        proposer_ens: "alice.eth",
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 14,
        end_blocktime: Math.floor(Date.now() / 1000) - 86400 * 7,
        start_block: 900000,
        end_block: 950000,
        lifecycle_stage: "SUCCEEDED",
        data_eng_properties: {
          liveness: "archived",
          source: "eas-oodao",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "1": "8000000000000000000000",
            "0": "1000000000000000000000",
          },
        },
        outcome: {
          "0x0000000000000000000000000000000000000000": {
            "1": "8000000000000000000000",
            "0": "1000000000000000000000",
          },
        },
        proposal_type: {
          eas_uid: "0x1111111111111111111111111111111111111111",
          name: "Standard Proposal",
          class: "STANDARD",
          quorum: 3000,
          description: "Standard proposal type",
          approval_threshold: 5000,
        },
        tags: ["tempcheck"],
        chain_id: 1,
        dao_id: namespace,
        uid: "2",
        transaction_hash:
          "0x1111111111111111111111111111111111111111111111111111111111111111",
        total_voting_power_at_start: "100000000000000000000000",
      },
      {
        id: "3",
        title: "Cancelled Proposal: Budget Reallocation",
        proposer: "0x9876543210987654321098765432109876543210",
        proposer_ens: null,
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 30,
        end_blocktime: Math.floor(Date.now() / 1000) - 86400 * 20,
        start_block: 800000,
        end_block: 850000,
        lifecycle_stage: "CANCELLED",
        data_eng_properties: {
          liveness: "archived",
          source: "dao_node",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "1": "3000000000000000000000",
            "0": "2000000000000000000000",
          },
        },
        proposal_type: 1,
        quorum: "5000000000000000000000",
        blocktime: Math.floor(Date.now() / 1000) - 86400 * 30,
        created_event: {
          block_number: "800000",
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 30,
          transaction_hash:
            "0x2222222222222222222222222222222222222222222222222222222222222222",
        },
        cancel_event: {
          block_number: "820000",
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 25,
          transaction_hash:
            "0x3333333333333333333333333333333333333333333333333333333333333333",
        },
      },
      {
        id: "4",
        title: "Optimistic Proposal: Quick Decision",
        proposer: "0x5555555555555555555555555555555555555555",
        proposer_ens: { detail: "bob.eth" },
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 5,
        end_blocktime: Math.floor(Date.now() / 1000) + 86400 * 2,
        start_block: 1050000,
        end_block: 1080000,
        lifecycle_stage: "ACTIVE",
        data_eng_properties: {
          liveness: "live",
          source: "eas-oodao",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "1": "12000000000000000000000",
            "0": "3000000000000000000000",
            "2": "1000000000000000000000",
          },
        },
        proposal_type: {
          eas_uid: "0x4444444444444444444444444444444444444444",
          name: "Optimistic Proposal",
          class: "OPTIMISTIC",
          quorum: 2000,
          description: "Optimistic proposal with lower quorum",
          approval_threshold: 6000,
        },
        chain_id: 1,
        dao_id: namespace,
        uid: "4",
        transaction_hash:
          "0x4444444444444444444444444444444444444444444444444444444444444444",
        total_voting_power_at_start: "200000000000000000000000",
      },
      {
        id: "5",
        title: "Archived Proposal: Governance Update",
        proposer: "0x6666666666666666666666666666666666666666",
        proposer_ens: "charlie.eth",
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 60,
        end_blocktime: Math.floor(Date.now() / 1000) - 86400 * 50,
        start_block: 700000,
        end_block: 750000,
        lifecycle_stage: "SUCCEEDED",
        data_eng_properties: {
          liveness: "archived",
          source: "dao_node",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "1": "25000000000000000000000",
            "0": "5000000000000000000000",
            "2": "3000000000000000000000",
          },
        },
        outcome: {
          "0x0000000000000000000000000000000000000000": {
            "1": "25000000000000000000000",
            "0": "5000000000000000000000",
            "2": "3000000000000000000000",
          },
        },
        proposal_type: 0,
        quorum: "15000000000000000000000",
        quorumVotes: "33000000000000000000000",
        votableSupply: "40000000000000000000000",
        approval_threshold: "5000",
        blocktime: Math.floor(Date.now() / 1000) - 86400 * 60,
        created_event: {
          block_number: "700000",
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 60,
          transaction_hash:
            "0x5555555555555555555555555555555555555555555555555555555555555555",
        },
        execute_event: {
          block_number: "760000",
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 48,
          transaction_hash:
            "0x6666666666666666666666666666666666666666666666666666666666666666",
        },
      },
      {
        id: "6",
        title: "Community Grant Proposal: Dev Tools Initiative",
        proposer: "0x7777777777777777777777777777777777777777",
        proposer_ens: "david.eth",
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 3,
        end_blocktime: Math.floor(Date.now() / 1000) + 86400 * 4,
        start_block: 1120000,
        end_block: 1150000,
        lifecycle_stage: "ACTIVE",
        data_eng_properties: {
          liveness: "live",
          source: "dao_node",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "0": "2000000000000000000000",
            "1": "18000000000000000000000",
            "2": "4000000000000000000000",
          },
        },
        outcome: {
          "0x0000000000000000000000000000000000000000": {
            "0": "2000000000000000000000",
            "1": "18000000000000000000000",
            "2": "4000000000000000000000",
          },
        },
        proposal_type: 0,
        quorum: "12000000000000000000000",
        quorumVotes: "24000000000000000000000",
        votableSupply: "60000000000000000000000",
        approval_threshold: "5000",
        blocktime: Math.floor(Date.now() / 1000) - 86400 * 3,
        created_event: {
          block_number: "1120000",
          transaction_index: 5,
          log_index: 12,
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 3,
          transaction_hash:
            "0x7777777777777777777777777777777777777777777777777777777777777777",
        },
      },
      {
        id: "7",
        title: "Temp Check: Protocol Fee Adjustment",
        proposer: "0x8888888888888888888888888888888888888888",
        proposer_ens: "emma.eth",
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 21,
        end_blocktime: Math.floor(Date.now() / 1000) - 86400 * 14,
        start_block: 850000,
        end_block: 880000,
        lifecycle_stage: "DEFEATED",
        data_eng_properties: {
          liveness: "archived",
          source: "eas-oodao",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "1": "4000000000000000000000",
            "0": "9000000000000000000000",
            "2": "1000000000000000000000",
          },
        },
        outcome: {
          "0x0000000000000000000000000000000000000000": {
            "1": "4000000000000000000000",
            "0": "9000000000000000000000",
            "2": "1000000000000000000000",
          },
        },
        proposal_type: {
          eas_uid: "0x8888888888888888888888888888888888888888",
          name: "Standard Proposal",
          class: "STANDARD",
          quorum: 3000,
          description: "Standard proposal type",
          approval_threshold: 5000,
        },
        tags: ["tempcheck"],
        chain_id: 1,
        dao_id: namespace,
        uid: "7",
        transaction_hash:
          "0x8888888888888888888888888888888888888888888888888888888888888888",
        total_voting_power_at_start: "120000000000000000000000",
      },
      {
        id: "8",
        title: "Emergency Protocol Upgrade",
        proposer: "0x9999999999999999999999999999999999999999",
        proposer_ens: null,
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 90,
        end_blocktime: Math.floor(Date.now() / 1000) - 86400 * 85,
        start_block: 600000,
        end_block: 620000,
        lifecycle_stage: "EXECUTED",
        data_eng_properties: {
          liveness: "archived",
          source: "dao_node",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "1": "30000000000000000000000",
            "0": "3000000000000000000000",
            "2": "2000000000000000000000",
          },
        },
        outcome: {
          "0x0000000000000000000000000000000000000000": {
            "1": "30000000000000000000000",
            "0": "3000000000000000000000",
            "2": "2000000000000000000000",
          },
        },
        proposal_type: 1,
        quorum: "20000000000000000000000",
        quorumVotes: "35000000000000000000000",
        votableSupply: "45000000000000000000000",
        approval_threshold: "5000",
        blocktime: Math.floor(Date.now() / 1000) - 86400 * 90,
        created_event: {
          block_number: "600000",
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 90,
          transaction_hash:
            "0x9999999999999999999999999999999999999999999999999999999999999999",
        },
        execute_event: {
          block_number: "625000",
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 83,
          transaction_hash:
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
      },
      {
        id: "9",
        title: "Marketing Campaign Proposal Q4",
        proposer: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        proposer_ens: { detail: "frank.eth" },
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 2,
        end_blocktime: Math.floor(Date.now() / 1000) + 86400 * 5,
        start_block: 1140000,
        end_block: 1170000,
        lifecycle_stage: "ACTIVE",
        data_eng_properties: {
          liveness: "live",
          source: "eas-oodao",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "1": "14000000000000000000000",
            "0": "6000000000000000000000",
            "2": "3000000000000000000000",
          },
        },
        proposal_type: {
          eas_uid: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          name: "Optimistic Proposal",
          class: "OPTIMISTIC",
          quorum: 2000,
          description: "Optimistic proposal with lower quorum",
          approval_threshold: 6000,
        },
        chain_id: 1,
        dao_id: namespace,
        uid: "9",
        transaction_hash:
          "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        total_voting_power_at_start: "180000000000000000000000",
      },
      {
        id: "10",
        title: "Treasury Diversification Strategy",
        proposer: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        proposer_ens: "grace.eth",
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 45,
        end_blocktime: Math.floor(Date.now() / 1000) - 86400 * 38,
        start_block: 650000,
        end_block: 680000,
        lifecycle_stage: "QUEUED",
        data_eng_properties: {
          liveness: "archived",
          source: "dao_node",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "1": "22000000000000000000000",
            "0": "7000000000000000000000",
            "2": "5000000000000000000000",
          },
        },
        outcome: {
          "0x0000000000000000000000000000000000000000": {
            "1": "22000000000000000000000",
            "0": "7000000000000000000000",
            "2": "5000000000000000000000",
          },
        },
        proposal_type: 0,
        quorum: "18000000000000000000000",
        quorumVotes: "34000000000000000000000",
        votableSupply: "55000000000000000000000",
        approval_threshold: "5000",
        blocktime: Math.floor(Date.now() / 1000) - 86400 * 45,
        created_event: {
          block_number: "650000",
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 45,
          transaction_hash:
            "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        },
      },
      {
        id: "11",
        title: "Temp Check: DAO Tooling Improvement",
        proposer: "0xcccccccccccccccccccccccccccccccccccccccc",
        proposer_ens: "henry.eth",
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 10,
        end_blocktime: Math.floor(Date.now() / 1000) - 86400 * 3,
        start_block: 1000000,
        end_block: 1030000,
        lifecycle_stage: "SUCCEEDED",
        data_eng_properties: {
          liveness: "archived",
          source: "eas-oodao",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "1": "16000000000000000000000",
            "0": "2000000000000000000000",
            "2": "1000000000000000000000",
          },
        },
        outcome: {
          "0x0000000000000000000000000000000000000000": {
            "1": "16000000000000000000000",
            "0": "2000000000000000000000",
            "2": "1000000000000000000000",
          },
        },
        proposal_type: {
          eas_uid: "0xcccccccccccccccccccccccccccccccccccccccc",
          name: "Standard Proposal",
          class: "STANDARD",
          quorum: 3000,
          description: "Standard proposal type",
          approval_threshold: 5000,
        },
        tags: ["tempcheck"],
        chain_id: 1,
        dao_id: namespace,
        uid: "11",
        transaction_hash:
          "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
        total_voting_power_at_start: "150000000000000000000000",
      },
      {
        id: "12",
        title: "Partnership Proposal: Cross-Chain Bridge",
        proposer: "0xdddddddddddddddddddddddddddddddddddddddd",
        proposer_ens: null,
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 1,
        end_blocktime: Math.floor(Date.now() / 1000) + 86400 * 6,
        start_block: 1160000,
        end_block: 1190000,
        lifecycle_stage: "ACTIVE",
        data_eng_properties: {
          liveness: "live",
          source: "dao_node",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "0": "8000000000000000000000",
            "1": "20000000000000000000000",
            "2": "6000000000000000000000",
          },
        },
        outcome: {
          "0x0000000000000000000000000000000000000000": {
            "0": "8000000000000000000000",
            "1": "20000000000000000000000",
            "2": "6000000000000000000000",
          },
        },
        proposal_type: 0,
        quorum: "16000000000000000000000",
        quorumVotes: "34000000000000000000000",
        votableSupply: "70000000000000000000000",
        approval_threshold: "5000",
        blocktime: Math.floor(Date.now() / 1000) - 86400 * 1,
        created_event: {
          block_number: "1160000",
          transaction_index: 3,
          log_index: 8,
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 1,
          transaction_hash:
            "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        },
      },
      {
        id: "13",
        title: "Deleted Proposal: Invalid Submission",
        proposer: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        proposer_ens: { detail: "ivan.eth" },
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 35,
        end_blocktime: Math.floor(Date.now() / 1000) - 86400 * 28,
        start_block: 750000,
        end_block: 780000,
        lifecycle_stage: "CANCELLED",
        data_eng_properties: {
          liveness: "archived",
          source: "eas-oodao",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "1": "1000000000000000000000",
            "0": "500000000000000000000",
          },
        },
        proposal_type: {
          eas_uid: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          name: "Standard Proposal",
          class: "STANDARD",
          quorum: 3000,
          description: "Standard proposal type",
          approval_threshold: 5000,
        },
        chain_id: 1,
        dao_id: namespace,
        uid: "13",
        transaction_hash:
          "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        total_voting_power_at_start: "95000000000000000000000",
        delete_event: {
          transaction_hash:
            "0x0000000000000000000000000000000000000000000000000000000000000001",
          dao_id: namespace,
          uid: "13",
          deleter: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          chain_id: 1,
          ref_uid: "0x0000000000000000000000000000000000000000",
          attestation_time: Math.floor(Date.now() / 1000) - 86400 * 34,
        },
      },
      {
        id: "14",
        title: "Ecosystem Growth Fund Allocation",
        proposer: "0xffffffffffffffffffffffffffffffffffffffff",
        proposer_ens: "julia.eth",
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 75,
        end_blocktime: Math.floor(Date.now() / 1000) - 86400 * 68,
        start_block: 550000,
        end_block: 580000,
        lifecycle_stage: "EXECUTED",
        data_eng_properties: {
          liveness: "archived",
          source: "dao_node",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "1": "28000000000000000000000",
            "0": "4000000000000000000000",
            "2": "4000000000000000000000",
          },
        },
        outcome: {
          "0x0000000000000000000000000000000000000000": {
            "1": "28000000000000000000000",
            "0": "4000000000000000000000",
            "2": "4000000000000000000000",
          },
        },
        proposal_type: 0,
        quorum: "20000000000000000000000",
        quorumVotes: "36000000000000000000000",
        votableSupply: "48000000000000000000000",
        approval_threshold: "5000",
        blocktime: Math.floor(Date.now() / 1000) - 86400 * 75,
        created_event: {
          block_number: "550000",
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 75,
          transaction_hash:
            "0x0000000000000000000000000000000000000000000000000000000000000002",
        },
        execute_event: {
          block_number: "590000",
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 66,
          transaction_hash:
            "0x0000000000000000000000000000000000000000000000000000000000000003",
        },
      },
      {
        id: "15",
        title: "Security Audit Funding Request",
        proposer: "0x0000000000000000000000000000000000000001",
        proposer_ens: "kate.eth",
        start_blocktime: Math.floor(Date.now() / 1000) - 86400 * 4,
        end_blocktime: Math.floor(Date.now() / 1000) + 86400 * 3,
        start_block: 1130000,
        end_block: 1160000,
        lifecycle_stage: "ACTIVE",
        data_eng_properties: {
          liveness: "live",
          source: "dao_node",
        },
        totals: {
          "0x0000000000000000000000000000000000000000": {
            "0": "3000000000000000000000",
            "1": "21000000000000000000000",
            "2": "5000000000000000000000",
          },
        },
        outcome: {
          "0x0000000000000000000000000000000000000000": {
            "0": "3000000000000000000000",
            "1": "21000000000000000000000",
            "2": "5000000000000000000000",
          },
        },
        proposal_type: 1,
        quorum: "14000000000000000000000",
        quorumVotes: "29000000000000000000000",
        votableSupply: "65000000000000000000000",
        approval_threshold: "5000",
        blocktime: Math.floor(Date.now() / 1000) - 86400 * 4,
        created_event: {
          block_number: "1130000",
          transaction_index: 7,
          log_index: 15,
          timestamp: Math.floor(Date.now() / 1000) - 86400 * 4,
          transaction_hash:
            "0x0000000000000000000000000000000000000000000000000000000000000004",
        },
      },
    ];

    const allProposals = dummyProposals;

    // Apply filter if needed
    let filteredProposals = allProposals;
    if (filter === "relevant") {
      // Filter out cancelled/deleted proposals for "relevant" filter
      filteredProposals = allProposals.filter(
        (proposal) =>
          !proposal.cancel_event &&
          !proposal.delete_event &&
          proposal.lifecycle_stage !== "CANCELLED"
      );
    } else if (filter === "temp-checks") {
      filteredProposals = allProposals.filter((proposal) =>
        proposal.tags?.includes("tempcheck")
      );
    }

    return {
      meta: {
        has_next: false,
        total_returned: filteredProposals.length,
        next_offset: 0,
      },
      data: filteredProposals,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      return {
        meta: {
          has_next: false,
          total_returned: 0,
          next_offset: 0,
        },
        data: [],
      };
    }
    console.error("Error fetching proposals from archive:", error);
    throw error;
  }
}

export const fetchProposalFromArchive = async (
  namespace: string,
  proposalId: string
) => {
  try {
    const archiveDaoNodeUrl = getArchiveSlugForDaoNodeProposal(
      namespace,
      proposalId
    );
    const archiveEasOodaoUrl = getArchiveSlugForEasOodaoProposal(
      namespace,
      proposalId
    );
    const [responseDaoNode, responseEasOodao] = await Promise.all([
      fetch(withCacheBust(archiveDaoNodeUrl), { cache: "no-store" }),
      fetch(withCacheBust(archiveEasOodaoUrl), { cache: "no-store" }),
    ]);

    if (!responseDaoNode.ok && !responseEasOodao.ok) {
      if (responseDaoNode.status === 404 && responseEasOodao.status === 404) {
        return null;
      }
      throw new Error(
        `Failed to fetch archive data: daoNode ${responseDaoNode.status} ${responseDaoNode.statusText}; easOodao ${responseEasOodao.status} ${responseEasOodao.statusText}`
      );
    }

    const [jsonTextDaoNode, jsonTextEasOodao] = await Promise.all([
      responseDaoNode.ok ? responseDaoNode.text() : Promise.resolve(""),
      responseEasOodao.ok ? responseEasOodao.text() : Promise.resolve(""),
    ]);
    const allProposalsDaoNode = responseDaoNode.ok
      ? JSON.parse(jsonTextDaoNode)
      : undefined;
    const allProposalsEasOodao = responseEasOodao.ok
      ? JSON.parse(jsonTextEasOodao)
      : undefined;
    return allProposalsDaoNode || allProposalsEasOodao;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      return null;
    }
    console.error("Error fetching proposals from archive:", error);
    throw error;
  }
};

export type ArchiveVoteRow = {
  citizen_type?: string | null;
  transaction_hash?: string | null;
  block_number: bigint;
  chain_id?: number | null;
  voter: string;
  support?: string | null;
  weight?: string | number;
  reason?: string | null;
  params?: Array<number> | null;
  choice?: Array<number> | null; // for Copeland proposal type
  vp?: string | number; // for Copeland proposal type
  ts?: number | string | null;
  x?: string | null;
  warpcast?: string | null;
  discord?: string | null;
  name?: string | null;
  image?: string | null;
  ens?: string | null;
};

export type ArchiveNonVoterRow = {
  citizen_type?: string | null;
  addr: string;
  vp?: string | number;
  ens?: string | null;
  bn?: number | string;
  x?: string | null;
  warpcast?: string | null;
  discord?: string | null;
  name?: string | null;
  image?: string | null;
};

const isBrowser = typeof window !== "undefined";

async function gunzipToString(buffer: ArrayBuffer): Promise<string> {
  if (!isBrowser) {
    const { gunzipSync } = await import("zlib");
    return gunzipSync(Buffer.from(buffer)).toString("utf-8");
  }

  if (typeof (globalThis as any).DecompressionStream === "function") {
    const decompressedStream = new Response(buffer).body?.pipeThrough(
      new (globalThis as any).DecompressionStream("gzip")
    );

    if (!decompressedStream) {
      throw new Error("Failed to read gzip stream from response body");
    }

    return await new Response(decompressedStream).text();
  }

  throw new Error("Gzip decompression is not supported in this environment");
}

async function fetchArchiveNdjson<T>(url: string): Promise<T[]> {
  const response = await fetch(withCacheBust(url), {
    cache: "no-store",
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch archive data: ${response.status} ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  let ndjsonText: string;
  try {
    ndjsonText = await gunzipToString(arrayBuffer);
  } catch (error) {
    console.warn(
      `Failed to decompress archive payload from ${url}, falling back to plain text`,
      error
    );
    const decoder = new TextDecoder();
    ndjsonText = decoder.decode(arrayBuffer);
  }
  return parseNDJSON<T>(ndjsonText);
}

/**
 * Fetch raw vote data from archive without transformation
 * Use this when you want to transform the data on the client side
 */
export async function fetchRawProposalVotesFromArchive({
  namespace,
  proposalId,
}: {
  namespace: string;
  proposalId: string;
}): Promise<ArchiveVoteRow[]> {
  try {
    return await fetchArchiveNdjson<ArchiveVoteRow>(
      getArchiveSlugForProposalVotes(namespace, proposalId)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      return [];
    }
    console.error("Error fetching raw votes from archive:", error);
    throw error;
  }
}

export type ArchiveNonVoter = {
  delegate: string;
  voting_power: string;
  twitter: string | null;
  warpcast: string | null;
  discord: string | null;
  citizen_type: string | null;
  voterMetadata: {
    name: string;
    image: string;
    type: string;
  } | null;
};

/**
 * Fetch raw non-voter data from archive without transformation
 * Use this when you want to transform the data on the client side
 */
export async function fetchRawProposalNonVotersFromArchive({
  namespace,
  proposalId,
}: {
  namespace: string;
  proposalId: string;
}): Promise<ArchiveNonVoterRow[]> {
  try {
    return await fetchArchiveNdjson<ArchiveNonVoterRow>(
      getArchiveSlugForProposalNonVoters(namespace, proposalId)
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
      return [];
    }
    console.error("Error fetching raw non-voters from archive:", error);
    throw error;
  }
}
