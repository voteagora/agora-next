# OFFCHAIN_STANDARD Proposal Type

> **Source:** `eas-oodao` | **Voting Module:** N/A (offchain only)

Purely offchain standard voting via EAS attestations for generic DAOs (e.g., Syndicate).

---

## Example Data

```json
{
  "transaction_hash": "0x893d0c6797176a32b0ca9aab17d6b63a3cee5c92c23ad97b9443d7ad1bfe1e6a",
  "dao_id": "0x73796e6469636174652e00aa36a7000000a58d9f",
  "uid": "0x8bf15ce6d4bd58216b59edccdac46162989cbcce6c32d0fc092d2ba54ec8e1da",
  "chain_id": 11155111,
  "tags": [
    "gov-proposal",
    "0xf1d29c9a9a176a90bdcdc9dd8ce90c1fbce3edcbf806c435389145ec6c90baae"
  ],
  "title": "Gov prop with link in tags",
  "created_block_number": 9705193,
  "created_time": 1764091620,
  "id": "0x8bf15ce6d4bd58216b59edccdac46162989cbcce6c32d0fc092d2ba54ec8e1da",
  "proposal_type": {
    "name": "Defaul Proposal Type",
    "class": "STANDARD",
    "quorum": 2000,
    "description": "This is a default Proposal Type",
    "approval_threshold": 5100,
    "eas_uid": "0x2c5cceb88eb661606f5d10c4480898d3ca65717f4461d446e9151a66ee039b5e"
  },
  "proposal_type_approval": "APPROVED",
  "proposer": "0xcC0B26236AFa80673b0859312a7eC16d2b72C1ea",
  "proposer_ens": null,
  "num_of_votes": 0,
  "outcome": {
    "token-holders": {}
  },
  "total_voting_power_at_start": "48633000000000000000000",
  "lifecycle_stage": "ACTIVE",
  "start_blocktime": 1764091603,
  "end_blocktime": 1764696403,
  "start_block": 9705191,
  "end_block": -1,
  "data_eng_properties": {
    "liveness": "live",
    "source": "eas-oodao"
  }
}
```

---

## Type Detection

```typescript
// Detected when:
source === "eas-oodao" && proposal_type.class === "STANDARD";
```

---

## Key Differences from Other Sources

| Aspect          | eas-oodao           | dao_node       | eas-atlas        |
| --------------- | ------------------- | -------------- | ---------------- |
| `proposal_type` | Object with config  | Numeric ID     | String enum      |
| `outcome`       | `token-holders` key | `no-param` key | `USER/APP/CHAIN` |
| Vote Format     | String (wei)        | String (wei)   | Number (count)   |
| `chain_id`      | Number              | Not present    | String           |

---

## Proposal Type Structure (eas-oodao specific)

```typescript
proposal_type: {
  name: string;                  // "Defaul Proposal Type"
  class: "STANDARD";             // Base voting class
  quorum: number;                // Basis points (2000 = 20%)
  description: string;           // Human-readable description
  approval_threshold: number;    // Basis points (5100 = 51%)
  eas_uid: string;               // EAS attestation for this type config
}
```

---

## Vote Outcome Structure

```typescript
outcome: {
  "token-holders": {
    "0"?: string,  // against votes (wei)
    "1"?: string,  // for votes (wei)
    "2"?: string   // abstain votes (wei)
  }
}
```

---

## Status Determination

### Inputs from proposal_type Object

```typescript
const quorumBps = proposal_type.quorum; // 2000 = 20%
const approvalThresholdBps = proposal_type.approval_threshold; // 5100 = 51%
const votableSupply = BigInt(total_voting_power_at_start);
```

### Vote Extraction

```typescript
const forVotes = BigInt(outcome["token-holders"]["1"] || "0");
const againstVotes = BigInt(outcome["token-holders"]["0"] || "0");
const abstainVotes = BigInt(outcome["token-holders"]["2"] || "0");
```

### Status Calculation

```typescript
// Quorum calculation
const quorumVotes = forVotes + abstainVotes;
const requiredQuorum = (votableSupply * BigInt(quorumBps)) / 10000n;

// Approval calculation
const totalVoted = forVotes + againstVotes;
const approvalPercent = totalVoted > 0n ? (forVotes * 10000n) / totalVoted : 0n;

// Status logic
if (quorumVotes < requiredQuorum) return "DEFEATED";
if (approvalPercent < approvalThresholdBps) return "DEFEATED";
if (forVotes > againstVotes) return "SUCCEEDED";
return "DEFEATED";
```

---

## Key Fields

| Field                         | Type   | Description                        |
| ----------------------------- | ------ | ---------------------------------- |
| `dao_id`                      | string | Unique DAO identifier              |
| `uid`                         | string | EAS attestation UID (same as `id`) |
| `proposal_type`               | object | Full type configuration            |
| `proposal_type_approval`      | string | `"PENDING"` or `"APPROVED"`        |
| `total_voting_power_at_start` | string | Votable supply for quorum calc     |
| `tags`                        | array  | Metadata tags                      |
| `delete_event`                | object | Present if proposal was deleted    |

---

## Lifecycle Stages

| Stage       | Description                                  |
| ----------- | -------------------------------------------- |
| `ACTIVE`    | Voting in progress                           |
| `SUCCEEDED` | Passed quorum and approval                   |
| `DEFEATED`  | Failed quorum or approval                    |
| `DELETED`   | Proposal was deleted (`delete_event` exists) |

---

## Test Cases

### Status Tests

1. **ACTIVE**: `currentTime < end_blocktime`
2. **DEFEATED - No Quorum**: `quorumVotes < requiredQuorum`
3. **DEFEATED - Low Approval**: `approvalPercent < approval_threshold`
4. **SUCCEEDED**: Quorum met + approval met + `forVotes > againstVotes`
5. **DELETED**: `delete_event` exists

### Edge Cases

1. **Empty Outcome**: No votes cast yet (`outcome: { "token-holders": {} }`)
2. **Pending Type Approval**: `proposal_type_approval === "PENDING"`
3. **Negative end_block**: `end_block: -1` indicates no block-based end
