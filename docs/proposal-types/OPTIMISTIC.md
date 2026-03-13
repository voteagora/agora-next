# OPTIMISTIC Proposal Type

> **Source:** `dao_node` | **Voting Module:** `optimistic`

Onchain proposal that passes unless vetoed by >50% of votable supply.

---

## Example Data

```json
{
  "block_number": "138897343",
  "transaction_index": 34,
  "log_index": 72,
  "proposer": "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
  "voting_module": "0x8980c97f0e8a3a69831139e51003e65238f1f343",
  "proposal_data": "00000000000000000000000000000000000000000000000000000000000007d00000000000000000000000000000000000000000000000000000000000000001",
  "start_block": 138897343,
  "end_block": 139156543,
  "proposal_type": 2,
  "id": "43611390841042156127733279917289923399354155784945103358272334363949369459237",
  "voting_module_name": "optimistic",
  "decoded_proposal_data": [[2000, true]],
  "totals": {
    "no-param": {
      "0": "1048876386614631985003741",
      "2": "2579472335678084488",
      "1": "4442279692041357431"
    }
  },
  "num_of_votes": 3961,
  "proposal_type_info": {
    "quorum": 0,
    "approval_threshold": 0,
    "name": "Optimistic",
    "module": null,
    "scopes": []
  },
  "hybrid": false,
  "after_start_block": false,
  "after_end_block": false,
  "start_blocktime": 1753393463,
  "title": "S8 Governance Fund Mission: Developer Advisory Board",
  "quorum": "34810871407579755069545456",
  "end_blocktime": 1753911863,
  "total_voting_power_at_start": "116036238025265850231818187",
  "lifecycle_stage": "SUCCEEDED",
  "data_eng_properties": {
    "liveness": "live",
    "source": "dao_node"
  }
}
```

---

## Type Detection

```typescript
// Detected when:
source === "dao_node" &&
  voting_module_name === "optimistic" &&
  hybrid === false;
```

---

## Vote Totals Structure

```typescript
totals: {
  "no-param": {
    "0": string,  // against/veto votes (wei)
    "1": string,  // for votes (wei) - rarely used
    "2": string   // abstain votes (wei) - rarely used
  }
}
```

---

## Decoded Proposal Data Structure

```typescript
decoded_proposal_data: [
  [
    disapprovalThreshold, // basis points (2000 = 20%)
    isRelative, // true = threshold is % of votable supply
  ],
];
```

---

## Status Determination

Two source-specific paths exist for simple OPTIMISTIC proposals.

### Path 1: dao_node

```typescript
const votableSupply = BigInt(
  proposal.votableSupply ?? proposal.total_voting_power_at_start ?? "0"
);
const voteTotals = proposal.totals?.["no-param"] || {};
const againstVotes = BigInt(voteTotals["0"] ?? "0");

// Extract threshold from decoded_proposal_data: [[thresholdBps, isRelative]]
let threshold: bigint;
if (Array.isArray(proposal.decoded_proposal_data?.[0])) {
  const thresholdBps = Number(proposal.decoded_proposal_data[0][0]);
  const isRelative = Boolean(proposal.decoded_proposal_data[0][1]);

  if (isRelative) {
    // Relative: threshold = votableSupply * bps / 10000
    threshold = (votableSupply * BigInt(thresholdBps)) / 10000n;
  } else {
    // Absolute: threshold is the raw basis-point value
    threshold = BigInt(thresholdBps);
  }
} else {
  // Default: 50% of votable supply
  threshold = votableSupply / 2n;
}

// Defeated only if strictly exceeded (not equal)
if (againstVotes > threshold) return "DEFEATED";
return "SUCCEEDED";
```

### Path 2: eas-oodao

Votes come from `outcome["token-holders"]`. The veto threshold is derived from `proposal_type.approval_threshold` (basis points).

```typescript
const votableSupply = BigInt(proposal.total_voting_power_at_start ?? "0");
const tokenHolders = proposal.outcome?.["token-holders"] ?? {};
const againstVotes = BigInt(tokenHolders["0"] ?? "0");

// Threshold from proposal_type.approval_threshold (basis points)
const thresholdBps = proposal.proposal_type?.approval_threshold ?? 0;
const threshold =
  thresholdBps > 0
    ? (votableSupply * BigInt(thresholdBps)) / 10000n
    : votableSupply / 2n; // default: 50%

if (againstVotes > threshold) return "DEFEATED";
return "SUCCEEDED";
```

### Default Threshold

```typescript
// For both paths: if no threshold config is found, use 50% of votable supply
const defaultThreshold = votableSupply / 2n;
```

---

## Key Fields

| Field                         | Type   | Description                       |
| ----------------------------- | ------ | --------------------------------- |
| `voting_module`               | string | Optimistic voting module address  |
| `voting_module_name`          | string | Always `"optimistic"`             |
| `decoded_proposal_data`       | array  | Threshold settings                |
| `total_voting_power_at_start` | string | Votable supply for threshold calc |
| `proposal_type_info.quorum`   | number | Usually 0 (not applicable)        |

---

## Key Differences from Other Types

| Aspect         | OPTIMISTIC        | STANDARD/APPROVAL       |
| -------------- | ----------------- | ----------------------- |
| Default Result | Passes            | Fails                   |
| Vote Type      | Veto only matters | For/Against both matter |
| Quorum         | Not applicable    | Required                |
| Approval       | Not required      | Required                |

---

## Test Cases

### dao_node Status Tests

1. **SUCCEEDED - No Vetoes**: `againstVotes == 0`
2. **SUCCEEDED - Relative Threshold Below**: `againstVotes < (supply * bps / 10000)`
3. **DEFEATED - Relative Threshold Exceeded**: `againstVotes > (supply * bps / 10000)`
4. **SUCCEEDED - Absolute Threshold**: `againstVotes <= BigInt(thresholdBps)`
5. **DEFEATED - Absolute Threshold Exceeded**: `againstVotes > BigInt(thresholdBps)`
6. **Terminal States**: Same as STANDARD (QUEUED, EXECUTED, CANCELLED)

### eas-oodao Status Tests

1. **SUCCEEDED**: `againstVotes <= (supply * approval_threshold / 10000)`
2. **DEFEATED**: `againstVotes > threshold`
3. **Default Threshold**: `approval_threshold = 0` → uses 50% of votable supply

### Edge Cases

1. **Missing Decoded Data**: Uses default 50% of votable supply
2. **Exact Threshold**: `againstVotes == threshold` → SUCCEEDED (strictly >, not >=)
3. **Zero Votable Supply**: `threshold = 0`, any against vote triggers DEFEATED
