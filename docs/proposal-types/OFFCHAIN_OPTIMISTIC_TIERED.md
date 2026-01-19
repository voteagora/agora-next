# OFFCHAIN_OPTIMISTIC_TIERED Proposal Type

> **Source:** `eas-atlas` | **Voting Module:** N/A (offchain only)

Purely offchain optimistic proposal with tiered veto thresholds across citizen groups.

---

## Example Data

```json
{
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
  "onchain_proposalid": 0,
  "max_approvals": 0,
  "criteria": 99,
  "criteria_value": 0,
  "calculationOptions": 0,
  "resolver": "0x2d69e3fa434898999faefe0edbc8a714c4a0fe0f",
  "hybrid": false,
  "title": "Maintenance Upgrade: 16a",
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
    "source": "eas-atlas"
  }
}
```

---

## Type Detection

```typescript
// Detected when:
source === "eas-atlas" &&
  proposal_type === "OPTIMISTIC_TIERED" &&
  (onchain_proposalid === 0 || onchain_proposalid === undefined);
// OR
source === "eas-atlas" && tiers?.length > 0 && !onchain_proposalid;
```

---

## Key Differences from HYBRID_OPTIMISTIC_TIERED

| Aspect        | OFFCHAIN_OPTIMISTIC_TIERED | HYBRID_OPTIMISTIC_TIERED |
| ------------- | -------------------------- | ------------------------ |
| Source        | `eas-atlas` only           | `dao_node` + `eas-atlas` |
| Delegates     | No onchain votes           | Has onchain votes        |
| Groups        | 3 (USER, APP, CHAIN)       | 4 (+ DELEGATES)          |
| Default Tiers | [65, 65, 65]               | [55, 45, 35]             |

---

## Vote Outcome Structure

```typescript
outcome: {
  USER: { "0": number, "2"?: number },   // against, abstain
  APP?: { "0"?: number, "2"?: number },
  CHAIN?: { "0"?: number, "2"?: number }
}
```

---

## Tier Thresholds

```typescript
tiers: [1100, 1400, 1700]; // basis points → [11%, 14%, 17%]
```

### Default Tiers (if not provided)

```typescript
const OFFCHAIN_OPTIMISTIC_TIERED_THRESHOLD = [65, 65, 65]; // percentages
```

---

## Status Determination

### Voter Groups (3 groups, no delegates)

| Group | Description            | Eligible Count |
| ----- | ---------------------- | -------------- |
| USER  | Citizen House - Users  | 1000           |
| APP   | Citizen House - Apps   | 100            |
| CHAIN | Citizen House - Chains | 15             |

### Veto Calculation (Average Method)

```typescript
const ELIGIBLE_COUNTS = { APP: 100, USER: 1000, CHAIN: 15 };

function calculateGroupVeto(group: string): number {
  const againstVotes = outcome[group]?.["0"] || 0;
  return (againstVotes / ELIGIBLE_COUNTS[group]) * 100;
}

// For OFFCHAIN_OPTIMISTIC_TIERED: uses average across 3 groups
const userVeto = calculateGroupVeto("USER");
const appVeto = calculateGroupVeto("APP");
const chainVeto = calculateGroupVeto("CHAIN");

const avgVeto = (userVeto + appVeto + chainVeto) / 3;

// Use first tier threshold (all same for offchain)
const threshold = tiers[0] / 100; // Convert basis points to %

const vetoTriggered = avgVeto >= threshold;
return vetoTriggered ? "DEFEATED" : "SUCCEEDED";
```

---

## Key Fields

| Field                | Type   | Description                     |
| -------------------- | ------ | ------------------------------- |
| `uid`                | string | EAS attestation UID             |
| `proposal_type`      | string | `"OPTIMISTIC_TIERED"`           |
| `tiers`              | array  | Veto thresholds in basis points |
| `onchain_proposalid` | number | `0` (no onchain link)           |
| `outcome`            | object | Citizen house veto votes        |

---

## Test Cases

### Status Tests

1. **SUCCEEDED - No Vetoes**: All groups have 0 veto votes
2. **SUCCEEDED - Below Threshold**: Average veto < tier threshold
3. **DEFEATED - Threshold Exceeded**: Average veto >= tier threshold

### Edge Cases

1. **Empty Tiers**: Use default [65, 65, 65] thresholds
2. **Missing Groups**: Handle undefined groups in outcome
3. **Only Abstain Votes**: "2" votes don't count as veto
