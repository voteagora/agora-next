# HYBRID_OPTIMISTIC_TIERED Proposal Type

> **Source:** `dao_node` + `eas-atlas` | **Voting Module:** `optimistic`

Onchain optimistic proposal with tiered veto thresholds across multiple voter groups.

---

## Example Data

```json
{
  "block_number": "141357360",
  "transaction_index": 4,
  "log_index": 1,
  "proposer": "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
  "voting_module": "0x8980c97f0e8a3a69831139e51003e65238f1f343",
  "proposal_data": "00000000000000000000000000000000000000000000000000000000000007d00000000000000000000000000000000000000000000000000000000000000001",
  "start_block": 141357360,
  "end_block": 141616560,
  "proposal_type": 2,
  "id": "32872683835969469583703720873380428072981331285364097246290907925181946140808",
  "voting_module_name": "optimistic",
  "decoded_proposal_data": [[2000, true]],
  "totals": {
    "no-param": {
      "0": "681353012042797422962615"
    }
  },
  "num_of_votes": 3291,
  "proposal_type_info": {
    "quorum": 0,
    "approval_threshold": 0,
    "name": "Optimistic",
    "module": null,
    "scopes": []
  },
  "hybrid": true,
  "govless_proposal": {
    "uid": "0x42247c00390396ad0d598e3ec39bc349c6a3f17fe44bcf574707a904960c127e",
    "schema": "0xfc5b3c0472d09ac39f0cb9055869e70c4c59413041e3fd317f357789389971e4",
    "time": 1758313523,
    "expirationTime": 0,
    "revocationTime": 0,
    "refUID": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "recipient": "0x0000000000000000",
    "attester": "0xa7f8ad892f3e6f25bb042c8ad7a220e74acebad8",
    "revocable": true,
    "chain_id": "10",
    "contract": "0xcdf27f107725988f2261ce2256bdfcde8b382b10",
    "id": "5434490809633408749910234742906885757078131497989209672789678220584951747865",
    "proposer": "0xa7f8ad892f3e6f25bb042c8ad7a220e74acebad8",
    "choices": [],
    "proposal_type_id": 2,
    "start_block": 141357367,
    "end_block": 141616567,
    "proposal_type": "OPTIMISTIC_TIERED",
    "tiers": [1100, 1400, 1700],
    "onchain_proposalid": 32872683835969469583703720873380428072981331285364097246290907925181946140808,
    "max_approvals": 0,
    "criteria": 99,
    "criteria_value": 0,
    "calculationOptions": 0,
    "resolver": "0x2d69e3fa434898999faefe0edbc8a714c4a0fe0f",
    "hybrid": true,
    "proposer_ens": null,
    "num_of_votes": 263,
    "outcome": {
      "USER": { "2": 203, "0": 58 },
      "APP": { "2": 1 },
      "CHAIN": { "2": 1 }
    },
    "start_blocktime": 1758313511,
    "end_blocktime": 1758831911,
    "data_eng_properties": {
      "liveness": "archived",
      "source": "eas-atlas",
      "hash": "d7dbae98c4102bae5944a666146c5f3af8d9a24ae72c4b11eef4db00a1d29872"
    }
  },
  "after_start_block": false,
  "after_end_block": false,
  "start_blocktime": 1758313497,
  "title": "Maintenance Upgrade: 16a",
  "quorum": "29048439693532197051157636",
  "end_blocktime": 1758831897,
  "total_voting_power_at_start": "96828132311773990170525455",
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
  hybrid === true &&
  govless_proposal?.proposal_type === "OPTIMISTIC_TIERED";
// OR govless_proposal?.tiers?.length > 0
```

---

## Vote Data Structure

### Onchain (Token House / Delegates)

```typescript
totals: {
  "no-param": {
    "0": string  // against/veto votes (wei)
  }
}
```

### Offchain (Citizen House)

```typescript
// "0" = against/veto, "2" = abstain
govless_proposal.outcome: {
  USER: { "0": number, "2"?: number },
  APP: { "0"?: number, "2"?: number },
  CHAIN: { "0"?: number, "2"?: number }
}
```

---

## Tiered Veto Logic

### Tier Thresholds

The `tiers` array contains basis points thresholds for different coalition sizes:

```typescript
tiers: [1100, 1400, 1700]; // basis points
// Converted to percentages: [11%, 14%, 17%]
```

| Index | Threshold | Meaning                         |
| ----- | --------- | ------------------------------- |
| 0     | 1100      | 11% - Required if 2 groups veto |
| 1     | 1400      | 14% - Required if 3 groups veto |
| 2     | 1700      | 17% - Required if 4 groups veto |

### Default Tiers

```typescript
const HYBRID_OPTIMISTIC_TIERED_DEFAULT = [55, 45, 35]; // percentages
// Note: Archive data uses basis points, convert as needed
```

---

## Status Determination

### Voter Groups

| Group     | Description            | Eligible Count |
| --------- | ---------------------- | -------------- |
| DELEGATES | Token House (onchain)  | 30% supply     |
| USER      | Citizen House - Users  | 1000           |
| APP       | Citizen House - Apps   | 100            |
| CHAIN     | Citizen House - Chains | 15             |

### Per-Group Veto Calculation

```typescript
const ELIGIBLE_COUNTS = { APP: 100, USER: 1000, CHAIN: 15 };

function calculateVetoPercentage(group: string): number {
  if (group === "DELEGATES") {
    const againstVotes = BigInt(totals["no-param"]["0"] || "0");
    const eligibleDelegates = (BigInt(total_voting_power_at_start) * 3n) / 10n; // 30%
    return (Number(againstVotes) / Number(eligibleDelegates)) * 100;
  }

  const against = outcome[group]?.["0"] || 0;
  return (against / ELIGIBLE_COUNTS[group]) * 100;
}
```

### Tiered Veto Check

```typescript
// Convert tier basis points to percentages
const [twoGroupThreshold, threeGroupThreshold, fourGroupThreshold] = tiers.map(
  (t) => t / 100
);

// Calculate veto percentages for each group
const groupVetoPercentages = {
  delegates: calculateVetoPercentage("DELEGATES"),
  users: calculateVetoPercentage("USER"),
  apps: calculateVetoPercentage("APP"),
  chains: calculateVetoPercentage("CHAIN"),
};

// Count groups exceeding each threshold
function countGroupsExceeding(threshold: number): number {
  return Object.values(groupVetoPercentages).filter((v) => v >= threshold)
    .length;
}

// Veto is triggered if:
// - 4+ groups exceed fourGroupThreshold (17%)
// - 3+ groups exceed threeGroupThreshold (14%)
// - 2+ groups exceed twoGroupThreshold (11%)
const vetoTriggered =
  countGroupsExceeding(fourGroupThreshold) >= 4 ||
  countGroupsExceeding(threeGroupThreshold) >= 3 ||
  countGroupsExceeding(twoGroupThreshold) >= 2;

return vetoTriggered ? "DEFEATED" : "SUCCEEDED";
```

---

## Key Fields

| Field                            | Type   | Description                     |
| -------------------------------- | ------ | ------------------------------- |
| `hybrid`                         | bool   | Always `true`                   |
| `govless_proposal.tiers`         | array  | Veto thresholds in basis points |
| `govless_proposal.proposal_type` | string | `"OPTIMISTIC_TIERED"`           |
| `govless_proposal.outcome`       | object | Per-group veto vote counts      |

---

## Test Cases

### Status Tests

1. **SUCCEEDED - No Vetoes**: All groups have 0 veto votes
2. **SUCCEEDED - Below All Thresholds**: No coalition meets threshold
3. **DEFEATED - 2 Groups Exceed**: 2+ groups exceed 11%
4. **DEFEATED - 3 Groups Exceed**: 3+ groups exceed 14%
5. **DEFEATED - 4 Groups Exceed**: 4 groups exceed 17%

### Edge Cases

1. **Missing Tiers**: Use default [55, 45, 35] percentages
2. **Empty Groups**: Some groups may have no veto votes
3. **Single Group High Veto**: One group at 100% doesn't trigger alone
