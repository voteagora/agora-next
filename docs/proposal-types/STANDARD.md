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

The `deriveStandardStatus` function handles four paths based on proposal source and type.

#### Path 1: dao_node (onchain)

```typescript
const voteTotals = proposal.totals?.["no-param"] || {};
const forVotes = BigInt(voteTotals["1"] ?? "0");
const againstVotes = BigInt(voteTotals["0"] ?? "0");
const abstainVotes = BigInt(voteTotals["2"] ?? "0");

const thresholds = resolveArchiveThresholds(proposal);
// thresholds.quorum: absolute BigInt (from proposal.quorum)
// thresholds.approvalThreshold: BigInt (basis points, e.g. 5100 = 51%)

// Approval check (% of for vs for+against)
const thresholdVotes = forVotes + againstVotes;
const voteThresholdPercent =
  thresholdVotes > 0n ? Number((forVotes * 10000n) / thresholdVotes) / 100 : 0;
const hasMetThreshold =
  voteThresholdPercent >= Number(thresholds.approvalThreshold) / 100 ||
  Number(thresholds.approvalThreshold) === 0;

// Quorum: tenant-specific (calculateQuorumBigInt)
// UNISWAP:  forVotes
// SCROLL:   forVotes + againstVotes + abstainVotes
// OPTIMISM: forVotes + againstVotes + abstainVotes
// default:  forVotes + abstainVotes
const quorumVotes = calculateQuorumBigInt(forVotes, againstVotes, abstainVotes);
const quorumMet = quorumVotes >= thresholds.quorum;

if (quorumMet && hasMetThreshold) {
  // Optimism backward-compat: if quorum was 0 in old governor, use simple majority
  if (namespace === OPTIMISM && thresholds.quorum === 0n) {
    if (forVotes < againstVotes) return "DEFEATED";
  }
  return "SUCCEEDED";
}
return "DEFEATED";
```

#### Path 2: eas-oodao (token-holders outcome)

```typescript
const voteTotals = proposal.outcome?.["token-holders"] || {};
const forVotes = BigInt(voteTotals["1"] ?? "0");
const againstVotes = BigInt(voteTotals["0"] ?? "0");
const abstainVotes = BigInt(voteTotals["2"] ?? "0");
// thresholds: quorum is absolute BigInt derived from proposal_type.quorum (basis points)
// approvalThreshold is BigInt basis points (e.g. 5100 = 51%)

// Same approval + quorum check logic as dao_node
if (quorumMet && hasMetThreshold) return "SUCCEEDED";
return "DEFEATED";
```

#### Path 3: HYBRID_STANDARD (dao_node + eas-atlas)

```typescript
// Weighted percentages computed via calcWeightedPercentage for each vote type
// forVotes = sum of (delegate% * 0.5 + user% * 1/6 + app% * 1/6 + chain% * 1/6)
// hasMetThreshold = forVotes / (forVotes + againstVotes) >= approvalThreshold / 100
// quorumVotes = calculateQuorumNumber(forVotes, againstVotes, abstainVotes) - tenant specific
// Note: quorum is compared as Number(thresholds.quorum) against a weighted %

if (hasMetThreshold || quorumVotes >= Number(thresholds.quorum))
  return "SUCCEEDED";
return "DEFEATED";
```

> **Note:** For HYBRID_STANDARD the OR condition means the proposal passes if EITHER the approval threshold OR the quorum check is met.

#### Path 4: OFFCHAIN_STANDARD (eas-atlas citizen-only)

```typescript
// Citizen votes aggregated from outcome.USER + outcome.APP + outcome.CHAIN
// resolveArchiveThresholds returns quorum=0n, approvalThreshold=0n for eas-atlas
// hasMetThreshold is always true (approvalThreshold === 0 branch)
// quorumMet is always true (quorumVotes >= 0)
// Result: always returns "DEFEATED" (inverted logic — treated as optimistic-style check)
if (quorumMet && hasMetThreshold) return "DEFEATED";
return "SUCCEEDED";
```

> **Warning:** The OFFCHAIN_STANDARD (eas-atlas) path uses inverted logic. With zero thresholds from `resolveArchiveThresholds`, it effectively always returns `"DEFEATED"`. This is a known limitation.

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

### Status Tests (dao_node)

1. **PENDING**: `startTime > now`
2. **ACTIVE**: `startTime < now < endTime`
3. **DEFEATED - No Quorum**: `quorumVotes < quorum` (tenant-specific quorum calc)
4. **DEFEATED - Low Approval**: `approvalPercent < approvalThreshold`
5. **SUCCEEDED**: Quorum met + approval threshold met
6. **DEFEATED - Optimism old governor**: `quorum === 0 && forVotes < againstVotes`
7. **QUEUED**: `queue_event` exists
8. **EXECUTED**: `execute_event` exists
9. **CANCELLED**: `cancel_event` exists

### Status Tests (eas-oodao)

1. **SUCCEEDED**: Token-holder quorum + approval met
2. **DEFEATED - No Quorum**: `quorumVotes < derived quorum`
3. **DEFEATED - Low Approval**: `approvalPercent < approvalThreshold`

### Status Tests (HYBRID_STANDARD)

1. **SUCCEEDED**: Weighted approval OR quorum met
2. **DEFEATED**: Neither weighted approval nor quorum met
