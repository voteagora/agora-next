# HYBRID_STANDARD Proposal Type

> **Source:** `dao_node` + `eas-atlas` | **Voting Module:** `standard`

Onchain standard proposal with linked offchain citizen voting (Joint House).

---

## Example Data

```json
{
  "block_number": "137683763",
  "transaction_index": 5,
  "log_index": 12,
  "proposer": "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
  "targets": ["0x0000000000000000000000000000000000000000"],
  "values": [0],
  "signatures": [""],
  "calldatas": [""],
  "start_block": 137683763,
  "end_block": 137942963,
  "proposal_type": 5,
  "id": "77379844029098348047245706083901850540159595802129942495264753179306805786028",
  "voting_module_name": "standard",
  "totals": {
    "no-param": {
      "1": "51160701912226686844288849",
      "2": "682760771180322714797638",
      "0": "1236339060163982872618718"
    }
  },
  "num_of_votes": 19167,
  "proposal_type_info": {
    "quorum": 3000,
    "approval_threshold": 6000,
    "name": "Joint House Standard  - [basic]",
    "module": null,
    "scopes": []
  },
  "hybrid": true,
  "govless_proposal": {
    "uid": "0xe73cdaca33221711fddfe6c7302b0f1d1d9bf093a9d04643710890d74b865fec",
    "schema": "0xfc5b3c0472d09ac39f0cb9055869e70c4c59413041e3fd317f357789389971e4",
    "time": 1750966303,
    "expirationTime": 0,
    "revocationTime": 0,
    "refUID": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "recipient": "0x0000000000000000",
    "attester": "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
    "revocable": true,
    "chain_id": "10",
    "contract": "0xcdf27f107725988f2261ce2256bdfcde8b382b10",
    "id": "48405998251522744502999146161336517858564712459537208322533788779401161220407",
    "proposer": "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
    "choices": [],
    "proposal_type_id": 5,
    "start_block": 137683304,
    "end_block": 137942504,
    "proposal_type": "STANDARD",
    "tiers": [],
    "onchain_proposalid": 77379844029098348047245706083901850540159595802129942495264753179306805786028,
    "max_approvals": 0,
    "criteria": 99,
    "criteria_value": 0,
    "calculationOptions": 0,
    "resolver": "0x2d69e3fa434898999faefe0edbc8a714c4a0fe0f",
    "hybrid": true,
    "proposer_ens": null,
    "num_of_votes": 576,
    "outcome": {
      "USER": { "0": 9, "1": 537, "2": 22 },
      "APP": { "1": 3 },
      "CHAIN": { "1": 5 }
    },
    "start_blocktime": 1750965385,
    "end_blocktime": 1751483785,
    "data_eng_properties": {
      "liveness": "archived",
      "source": "eas-atlas",
      "hash": "b3403bcc74e2b1444d0cfe3892e8884d70454d58b72a1fa01c19c57a483786d7"
    }
  },
  "after_start_block": false,
  "after_end_block": false,
  "start_blocktime": 1750966303,
  "title": "Season 8: Intent Ratification",
  "quorum": "34810871407579755069545456",
  "end_blocktime": 1751484703,
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
  voting_module_name === "standard" &&
  hybrid === true &&
  govless_proposal !== undefined;
```

---

## Vote Data Structure

### Onchain (Token House / Delegates)

```typescript
totals: {
  "no-param": {
    "0": string,  // against votes (wei)
    "1": string,  // for votes (wei)
    "2": string   // abstain votes (wei)
  }
}
```

### Offchain (Citizen House)

```typescript
govless_proposal.outcome: {
  USER: { "0": number, "1": number, "2": number },   // against, for, abstain
  APP: { "0"?: number, "1"?: number, "2"?: number },
  CHAIN: { "0"?: number, "1"?: number, "2"?: number }
}
```

---

## Status Determination

### Voter Groups & Weights

| Group     | Description            | Eligible Count        | Weight  |
| --------- | ---------------------- | --------------------- | ------- |
| DELEGATES | Token House (onchain)  | 30% of votable supply | 50%     |
| USER      | Citizen House - Users  | 1000                  | ~16.67% |
| APP       | Citizen House - Apps   | 100                   | ~16.67% |
| CHAIN     | Citizen House - Chains | 15                    | ~16.67% |

### Calculation Logic

```typescript
const HYBRID_VOTE_WEIGHTS = {
  delegates: 0.5,
  apps: 1 / 6,
  users: 1 / 6,
  chains: 1 / 6,
};

const ELIGIBLE_COUNTS = {
  APP: 100,
  USER: 1000,
  CHAIN: 15,
};

// Per-group tally calculation
function calculateGroupTally(
  forVotes: number,
  againstVotes: number,
  abstainVotes: number,
  eligibleCount: number,
  calculationOptions: 0 | 1
) {
  const quorumVotes =
    calculationOptions === 1 ? forVotes : forVotes + abstainVotes;
  const totalVoted = forVotes + againstVotes;

  return {
    quorum: quorumVotes / eligibleCount, // 0-1 participation ratio
    approval: totalVoted > 0 ? forVotes / totalVoted : 0, // 0-1 approval ratio
  };
}

// Final weighted calculation
const finalQuorum =
  delegatesTally.quorum * 0.5 +
  appsTally.quorum * (1 / 6) +
  usersTally.quorum * (1 / 6) +
  chainsTally.quorum * (1 / 6);

const finalApproval =
  delegatesTally.approval * 0.5 +
  appsTally.approval * (1 / 6) +
  usersTally.approval * (1 / 6) +
  chainsTally.approval * (1 / 6);

// Thresholds
const QUORUM_THRESHOLD = 0.3; // 30%
const approvalThreshold = proposal_type_info.approval_threshold / 10000; // Convert basis points

// Status
const quorumMet = finalQuorum >= QUORUM_THRESHOLD;
const approvalMet = finalApproval >= approvalThreshold;

if (quorumMet && approvalMet) return "SUCCEEDED";
return "DEFEATED";
```

---

## Key Fields

| Field                                 | Type   | Description                      |
| ------------------------------------- | ------ | -------------------------------- |
| `hybrid`                              | bool   | Always `true`                    |
| `govless_proposal`                    | object | Nested offchain voting data      |
| `govless_proposal.outcome`            | object | Citizen house vote tallies       |
| `govless_proposal.onchain_proposalid` | number | Links to parent onchain proposal |
| `govless_proposal.calculationOptions` | number | 0 = for+abstain, 1 = for only    |

---

## Test Cases

### Status Tests

1. **DEFEATED - Low Weighted Quorum**: `finalQuorum < 0.30`
2. **DEFEATED - Low Weighted Approval**: `finalApproval < approval_threshold`
3. **SUCCEEDED**: Both quorum and approval met
4. **Terminal States**: Same as STANDARD (QUEUED, EXECUTED, CANCELLED)

### Edge Cases

1. **Missing Groups**: Some citizen groups may have empty outcomes
2. **Zero Votes in Group**: Should handle division by zero in approval calc
3. **Asymmetric Timing**: Offchain voting may have different timing than onchain
