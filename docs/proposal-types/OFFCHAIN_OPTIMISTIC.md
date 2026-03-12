# OFFCHAIN_OPTIMISTIC Proposal Type

> **Source:** `eas-atlas` | **Voting Module:** N/A (offchain only)

Purely offchain optimistic proposal with simple veto threshold (no tiers).

---

## Example Data

```json
{
  "uid": "0xd70f9590ca82e2d263d95ba72a76c9bc9e2a6007c5c906a699794776a2f47d4d",
  "schema": "0xfc5b3c0472d09ac39f0cb9055869e70c4c59413041e3fd317f357789389971e4",
  "time": 1753386161,
  "expirationTime": 0,
  "revocationTime": 0,
  "refUID": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "recipient": "0x0000000000000000",
  "attester": "0xa7f8ad892f3e6f25bb042c8ad7a220e74acebad8",
  "revocable": true,
  "chain_id": "10",
  "contract": "0xcdf27f107725988f2261ce2256bdfcde8b382b10",
  "id": "53721753240293661829219520100025902752310594158223853909519165901524759483343",
  "proposer": "0xa7f8ad892f3e6f25bb042c8ad7a220e74acebad8",
  "choices": [],
  "proposal_type_id": 2,
  "start_block": 138893686,
  "end_block": 139152886,
  "proposal_type": "OPTIMISTIC",
  "tiers": [],
  "onchain_proposalid": 0,
  "max_approvals": 0,
  "criteria": 99,
  "criteria_value": 0,
  "calculationOptions": 0,
  "resolver": "0x2d69e3fa434898999faefe0edbc8a714c4a0fe0f",
  "hybrid": false,
  "title": "S8 Retro Funding Mission: Onchain Builders",
  "proposer_ens": null,
  "num_of_votes": 137,
  "outcome": {
    "USER": { "0": 137 }
  },
  "start_blocktime": 1753386149,
  "end_blocktime": 1753904549,
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
  proposal_type === "OPTIMISTIC" &&
  (tiers === undefined || tiers.length === 0) &&
  (onchain_proposalid === 0 || onchain_proposalid === undefined);
```

---

## Key Differences from OFFCHAIN_OPTIMISTIC_TIERED

| Aspect          | OFFCHAIN_OPTIMISTIC | OFFCHAIN_OPTIMISTIC_TIERED      |
| --------------- | ------------------- | ------------------------------- |
| `proposal_type` | `"OPTIMISTIC"`      | `"OPTIMISTIC_TIERED"`           |
| `tiers`         | Empty `[]`          | Has values `[1100, 1400, 1700]` |
| Threshold Logic | Simple average      | Tiered coalition                |

---

## Vote Outcome Structure

```typescript
outcome: {
  USER: { "0": number },   // against/veto votes
  APP?: { "0"?: number },
  CHAIN?: { "0"?: number }
}
```

---

## Status Determination

OFFCHAIN_OPTIMISTIC falls through to `calculateTieredVeto` with the flat `OFFCHAIN_OPTIMISTIC_THRESHOLD = [20, 20, 20]`. It does **not** use the average method.

### Default Thresholds

```typescript
// All three tiers set to the same 20% flat threshold
const OFFCHAIN_OPTIMISTIC_THRESHOLD = [20, 20, 20];
```

### Veto Calculation

Since this is a pure eas-atlas proposal (no delegates), `delegateVeto = 0`. The tiered multi-group check is applied across `[delegateVeto, appVeto, userVeto, chainVeto]`:

```typescript
const ELIGIBLE_COUNTS = { apps: 100, users: 1000, chains: 15 };
// Note: the code looks for lowercase "apps", "users", "chains" keys in outcome

const appVeto = ((outcome?.["apps"]?.["0"] ?? 0) / ELIGIBLE_COUNTS.apps) * 100;
const userVeto =
  ((outcome?.["users"]?.["0"] ?? 0) / ELIGIBLE_COUNTS.users) * 100;
const chainVeto =
  ((outcome?.["chains"]?.["0"] ?? 0) / ELIGIBLE_COUNTS.chains) * 100;

// delegateVeto = 0 (no onchain delegates for pure eas-atlas)
const vetoPercentages = [0, appVeto, userVeto, chainVeto];

const countExceeding = (threshold: number) =>
  vetoPercentages.filter((v) => v >= threshold).length;

const tiers = [20, 20, 20]; // OFFCHAIN_OPTIMISTIC_THRESHOLD
const vetoTriggered =
  countExceeding(tiers[2]) >= 4 || // impossible: delegate is always 0
  countExceeding(tiers[1]) >= 3 || // all 3 citizen groups >= 20%
  countExceeding(tiers[0]) >= 2; // any 2 citizen groups >= 20%

return vetoTriggered ? "DEFEATED" : "SUCCEEDED";
```

> **Effective trigger:** Veto fires when **2 or more** citizen groups each have >= 20% against votes independently (not averaged).

---

## Key Fields

| Field                | Type   | Description              |
| -------------------- | ------ | ------------------------ |
| `uid`                | string | EAS attestation UID      |
| `proposal_type`      | string | `"OPTIMISTIC"`           |
| `tiers`              | array  | Empty `[]`               |
| `onchain_proposalid` | number | `0` (no onchain link)    |
| `outcome`            | object | Citizen house veto votes |

---

## Test Cases

### Status Tests

1. **SUCCEEDED - No Vetoes**: All groups have 0 veto votes
2. **SUCCEEDED - Below Threshold**: Average veto < 20%
3. **DEFEATED - Threshold Exceeded**: Average veto >= 20%

### Edge Cases

1. **Single Group Voting**: Only USER has votes, others empty
2. **Missing Groups**: Handle undefined groups in outcome
