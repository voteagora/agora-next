# STANDARD Proposal Type

> **Source:** `dao_node` | **Voting Module:** `standard`

Simple onchain for/against/abstain voting on the DAO governor contract.

---

## Example Data

```json
{
  "block_number": "139798607",
  "transaction_index": 19,
  "log_index": 62,
  "proposer": "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
  "targets": ["0x0000000000000000000000000000000000000000"],
  "values": [0],
  "signatures": [""],
  "calldatas": [""],
  "start_block": 139798607,
  "end_block": 140057807,
  "proposal_type": 0,
  "id": "95125315478676153337636309965804486010918292377915044655013986825087199254978",
  "voting_module_name": "standard",
  "queue_event": {
    "block_number": "140057946",
    "transaction_index": 19,
    "log_index": 31,
    "eta": 1755973869,
    "id": "95125315478676153337636309965804486010918292377915044655013986825087199254978",
    "timestamp": 1755714669
  },
  "execute_event": {
    "block_number": "140194574",
    "transaction_index": 25,
    "log_index": 1,
    "id": "95125315478676153337636309965804486010918292377915044655013986825087199254978",
    "timestamp": 1755987925
  },
  "totals": {
    "no-param": {
      "0": "48220440983038447128018",
      "1": "46330174969101274671610001",
      "2": "4120144602474433253504"
    }
  },
  "num_of_votes": 6192,
  "proposal_type_info": {
    "quorum": 3000,
    "approval_threshold": 5100,
    "name": "default",
    "module": null,
    "scopes": []
  },
  "hybrid": false,
  "after_start_block": false,
  "after_end_block": false,
  "start_blocktime": 1755195991,
  "title": "Security Council Season 7 Retroactive Funding Request",
  "quorum": "29048439693532197051157636",
  "end_blocktime": 1755714391,
  "total_voting_power_at_start": "96828132311773990170525455",
  "lifecycle_stage": "EXECUTED",
  "data_eng_properties": {
    "liveness": "archived",
    "source": "dao_node"
  }
}
```

---

## Type Detection

```typescript
// Detected when:
source === "dao_node" && voting_module_name === "standard" && hybrid === false;
```

---

## Vote Totals Structure

```typescript
totals: {
  "no-param": {
    "0": string,  // against votes (wei)
    "1": string,  // for votes (wei)
    "2": string   // abstain votes (wei)
  }
}
```

---

## Status Determination

### Terminal States (checked first)

| Condition                          | Status      |
| ---------------------------------- | ----------- |
| `cancel_event` exists              | `CANCELLED` |
| `execute_event` exists             | `EXECUTED`  |
| `queue_event` exists + >10 days    | `PASSED`    |
| `queue_event` exists + has actions | `QUEUED`    |

### Timing States

| Condition                              | Status    |
| -------------------------------------- | --------- |
| `currentBlock < start_block`           | `PENDING` |
| `currentBlock < end_block`             | `ACTIVE`  |
| After `end_block` → calculate by votes | See below |

### Vote-Based Status

```typescript
// Inputs (using BigInt for precision)
const voteTotals = proposal.totals?.["no-param"] || {};
const forVotes = BigInt(voteTotals["1"] ?? "0");
const againstVotes = BigInt(voteTotals["0"] ?? "0");
const abstainVotes = BigInt(voteTotals["2"] ?? "0");

// Get thresholds
const thresholds = resolveArchiveThresholds(proposal);
// thresholds.quorum is bigint
// thresholds.approvalThreshold is bigint (basis points)

// Quorum calculation (varies by calculationOptions)
// calculationOptions=1: forVotes only
// default: forVotes + abstainVotes
const calculationOptions = proposal.calculationOptions ?? 0;
const quorumVotes =
  calculationOptions === 1 ? forVotes : forVotes + abstainVotes;

// Approval calculation
const thresholdVotes = forVotes + againstVotes;
const voteThresholdPercent =
  thresholdVotes > 0n ? Number((forVotes * 10000n) / thresholdVotes) / 100 : 0;

// Check approval threshold
const hasMetThreshold =
  voteThresholdPercent >= Number(thresholds.approvalThreshold) / 100 ||
  Number(thresholds.approvalThreshold) === 0;

// Check quorum
const quorumMet = quorumVotes >= thresholds.quorum;

// Status logic
if (!quorumMet || !hasMetThreshold) return "DEFEATED";
if (forVotes > againstVotes) return "SUCCEEDED";
if (forVotes < againstVotes) return "DEFEATED";
return "FAILED";
```

---

## Key Fields

| Field                         | Type   | Description                            |
| ----------------------------- | ------ | -------------------------------------- |
| `proposal_type`               | number | Numeric type ID (0 for basic)          |
| `voting_module_name`          | string | Always `"standard"`                    |
| `proposal_type_info.quorum`   | number | Quorum threshold (basis points)        |
| `approval_threshold`          | number | Approval threshold (basis points)      |
| `total_voting_power_at_start` | string | Total votable supply at proposal start |
| `queue_event`                 | object | Populated when proposal is queued      |
| `execute_event`               | object | Populated when proposal is executed    |
| `cancel_event`                | object | Populated when proposal is cancelled   |

---

## Test Cases

### Status Tests

1. **PENDING**: `currentBlock < start_block`
2. **ACTIVE**: `start_block <= currentBlock < end_block`
3. **DEFEATED - No Quorum**: `quorumVotes < quorum`
4. **DEFEATED - Low Approval**: `approvalPercent < approval_threshold`
5. **SUCCEEDED**: Quorum met + approval met + `forVotes > againstVotes`
6. **QUEUED**: `queue_event` exists + no `execute_event`
7. **EXECUTED**: `execute_event` exists
8. **CANCELLED**: `cancel_event` exists
