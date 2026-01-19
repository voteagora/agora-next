# HYBRID_APPROVAL Proposal Type

> **Source:** `dao_node` + `eas-atlas` | **Voting Module:** `approval`

Onchain approval voting with linked offchain citizen voting (Joint House).

---

## Example Data

```json
{
  "block_number": "138893255",
  "transaction_index": 20,
  "log_index": 52,
  "proposer": "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
  "voting_module": "0x8060b18290f48fc0bf2149eeb2f3c280bde7674f",
  "proposal_data": "00000000...",
  "start_block": 138893255,
  "end_block": 139152455,
  "proposal_type": 3,
  "id": "104658512477211447238723406913978051219515164565395855005009394415444207632959",
  "voting_module_name": "approval",
  "decoded_proposal_data": [
    [
      [
        0,
        [],
        [],
        [],
        " [0x937...c1B](https://atlas.optimism.io/optimist-f8bd)"
      ],
      [0, [], [], [], "[blockdev](https://atlas.optimism.io/blockdev)"],
      [
        0,
        [],
        [],
        [],
        "[Denispro2015.base.eth](https://atlas.optimism.io/denispro2015)"
      ],
      [0, [], [], [], "[devtooligan](https://atlas.optimism.io/devtooligan)"],
      [0, [], [], [], "[Kalambet Peter](https://atlas.optimism.io/kalambet)"],
      [0, [], [], [], "[m4rio](https://atlas.optimism.io/m4rio)"],
      [0, [], [], [], "[𓀣 Odysseas.eth 𓀢](https://atlas.optimism.io/odysseas)"],
      [0, [], [], [], "[shazow](https://atlas.optimism.io/shazow.eth)"],
      [0, [], [], [], "[Vectorized](https://atlas.optimism.io/optimizoor)"],
      [0, [], [], [], "[wbnns](https://atlas.optimism.io/wbnns)"]
    ],
    [10, 1, "0x0000000000000000000000000000000000000000", 7, 0]
  ],
  "totals": {
    "0": { "1": "494840720339937380604174" },
    "1": { "1": "43249974562603763880275149" },
    "2": { "1": "1291526107852067992108479" },
    "3": { "1": "46965010355831679667971681" },
    "4": { "1": "2902662435454127187975377" },
    "5": { "1": "36144058584410294528401222" },
    "6": { "1": "39004416717606869985566776" },
    "7": { "1": "20020758738758459216786232" },
    "8": { "1": "41304728752606317816936402" },
    "9": { "1": "35969569307001054728892495" }
  },
  "num_of_votes": 4753,
  "proposal_type_info": {
    "quorum": 3000,
    "approval_threshold": 5100,
    "name": "Default - Approval Voting",
    "module": null,
    "scopes": []
  },
  "hybrid": true,
  "govless_proposal": {
    "uid": "0x46e273e2820a4254c6d3b79cf101d82dac8a25abb4eb0e8dd940c4758553fac0",
    "schema": "0xfc5b3c0472d09ac39f0cb9055869e70c4c59413041e3fd317f357789389971e4",
    "time": 1753386147,
    "expirationTime": 0,
    "revocationTime": 0,
    "refUID": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "recipient": "0x0000000000000000",
    "attester": "0xa7f8ad892f3e6f25bb042c8ad7a220e74acebad8",
    "revocable": true,
    "chain_id": "10",
    "contract": "0xcdf27f107725988f2261ce2256bdfcde8b382b10",
    "id": "68834618204954752980616045246382031709597817332135218080725189431506628530189",
    "proposer": "0xa7f8ad892f3e6f25bb042c8ad7a220e74acebad8",
    "choices": [
      " [0x937...c1B](https://atlas.optimism.io/optimist-f8bd)",
      "[blockdev](https://atlas.optimism.io/blockdev)",
      "[Denispro2015.base.eth](https://atlas.optimism.io/denispro2015)",
      "[devtooligan](https://atlas.optimism.io/devtooligan)",
      "[Kalambet Peter](https://atlas.optimism.io/kalambet)",
      "[m4rio](https://atlas.optimism.io/m4rio)",
      "[𓀣 Odysseas.eth 𓀢](https://atlas.optimism.io/odysseas)",
      "[shazow](https://atlas.optimism.io/shazow.eth)",
      "[Vectorized](https://atlas.optimism.io/optimizoor)",
      "[wbnns](https://atlas.optimism.io/wbnns)"
    ],
    "proposal_type_id": 3,
    "start_block": 138893678,
    "end_block": 139152878,
    "proposal_type": "APPROVAL",
    "tiers": [],
    "onchain_proposalid": 104658512477211447238723406913978051219515164565395855005009394415444207632959,
    "max_approvals": 10,
    "criteria": 1,
    "criteria_value": 7,
    "calculationOptions": 0,
    "resolver": "0x2d69e3fa434898999faefe0edbc8a714c4a0fe0f",
    "hybrid": true,
    "proposer_ens": null,
    "num_of_votes": 393,
    "outcome": {
      "USER": {
        "0": { "1": 80 },
        "1": { "1": 227 },
        "2": { "1": 97 },
        "3": { "1": 170 },
        "4": { "1": 93 },
        "5": { "1": 160 },
        "6": { "1": 147 },
        "7": { "1": 110 },
        "8": { "1": 120 },
        "9": { "1": 119 }
      },
      "APP": {
        "0": { "1": 1 },
        "1": { "1": 7 },
        "2": { "1": 4 },
        "3": { "1": 7 },
        "4": { "1": 6 },
        "5": { "1": 7 },
        "6": { "1": 5 },
        "7": { "1": 7 },
        "8": { "1": 7 },
        "9": { "1": 7 }
      },
      "CHAIN": {
        "1": { "1": 4 },
        "3": { "1": 4 },
        "4": { "1": 2 },
        "5": { "1": 4 },
        "6": { "1": 4 },
        "7": { "1": 4 },
        "8": { "1": 2 },
        "9": { "1": 4 }
      }
    },
    "start_blocktime": 1753386133,
    "end_blocktime": 1753904533,
    "data_eng_properties": {
      "liveness": "archived",
      "source": "eas-atlas",
      "hash": "47271c6058b553010bae88f1e3501964bc6c5d2d7d0df7c79d5770cc63f2da48"
    }
  },
  "after_start_block": false,
  "after_end_block": false,
  "start_blocktime": 1753385287,
  "title": "Developer Advisory Board Election: Members",
  "quorum": "34810871407579755069545456",
  "end_blocktime": 1753903687,
  "total_voting_power_at_start": "116036238025265850231818187",
  "lifecycle_stage": "SUCCEEDED",
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
source === "dao_node" &&
  voting_module_name === "approval" &&
  hybrid === true &&
  govless_proposal !== undefined;
```

---

## Vote Data Structure

### Onchain (Token House / Delegates)

```typescript
// Per-option vote totals
totals: {
  "0": { "1": string },  // Option 0 votes (wei)
  "1": { "1": string },  // Option 1 votes (wei)
  // ...
}
```

### Offchain (Citizen House)

```typescript
// Per-option per-group vote counts
govless_proposal.outcome: {
  USER: {
    "0": { "1": number },  // Option 0 approval votes
    "1": { "1": number },  // Option 1 approval votes
    // ...
  },
  APP: { ... },
  CHAIN: { ... }
}
```

---

## Status Determination

### Voter Groups & Weights

| Group     | Description            | Eligible Count | Weight  |
| --------- | ---------------------- | -------------- | ------- |
| DELEGATES | Token House (onchain)  | 30% supply     | 50%     |
| USER      | Citizen House - Users  | 1000           | ~16.67% |
| APP       | Citizen House - Apps   | 100            | ~16.67% |
| CHAIN     | Citizen House - Chains | 15             | ~16.67% |

### Weighted Participation Calculation

```typescript
const ELIGIBLE_COUNTS = { APP: 100, USER: 1000, CHAIN: 15 };

// Per-option weighted percentage
function calculateOptionWeightedPercentage(optionIndex: string) {
  const delegateVotes = totals[optionIndex]?.["1"] || "0";
  const userVotes = outcome.USER?.[optionIndex]?.["1"] || 0;
  const appVotes = outcome.APP?.[optionIndex]?.["1"] || 0;
  const chainVotes = outcome.CHAIN?.[optionIndex]?.["1"] || 0;

  // Calculate participation ratios
  const delegateRatio = Number(delegateVotes) / eligibleDelegates;
  const userRatio = userVotes / ELIGIBLE_COUNTS.USER;
  const appRatio = appVotes / ELIGIBLE_COUNTS.APP;
  const chainRatio = chainVotes / ELIGIBLE_COUNTS.CHAIN;

  // Apply weights
  return (
    delegateRatio * 0.5 * 100 +
    userRatio * (1 / 6) * 100 +
    appRatio * (1 / 6) * 100 +
    chainRatio * (1 / 6) * 100
  );
}

// Unique participation (deduplicated across options)
const totalWeightedParticipation = calculateUniqueParticipation();
```

### Quorum Check

```typescript
const QUORUM_THRESHOLD = 30; // 30%

const quorumMet = totalWeightedParticipation >= QUORUM_THRESHOLD;
```

### Criteria-Based Status

```typescript
// From proposalStatus.ts - uses calculateHybridApprovalProposalMetrics
const metrics = calculateHybridApprovalProposalMetrics({
  proposalResults: kind,
  proposalData: proposalData.kind,
  quorum: Number(quorum!),
  createdTime,
});

// Check if weighted quorum is met first
if (!metrics.quorumMet) {
  return "DEFEATED";
}

// THRESHOLD: Check if any option passes threshold
if (kind.criteria === "THRESHOLD") {
  return metrics.thresholdMet ? "SUCCEEDED" : "DEFEATED";
} else {
  // TOP_CHOICES: Auto-succeeds if quorum met
  return "SUCCEEDED";
}
```

---

## Key Fields

| Field                             | Type   | Description                     |
| --------------------------------- | ------ | ------------------------------- |
| `hybrid`                          | bool   | Always `true`                   |
| `govless_proposal`                | object | Nested offchain voting data     |
| `govless_proposal.choices`        | array  | Option descriptions             |
| `govless_proposal.outcome`        | object | Per-option per-group votes      |
| `govless_proposal.criteria`       | number | 1 = TOP_CHOICES, 99 = THRESHOLD |
| `govless_proposal.criteria_value` | number | Winners count or threshold      |
| `govless_proposal.max_approvals`  | number | Max options a voter can approve |

---

## Test Cases

### Status Tests

1. **DEFEATED - No Quorum**: `totalWeightedParticipation < 30%`
2. **SUCCEEDED - TOP_CHOICES**: Quorum met, top N identified
3. **SUCCEEDED - THRESHOLD**: Quorum met + option exceeds threshold
4. **DEFEATED - THRESHOLD**: No options exceed threshold
5. **Terminal States**: Same as STANDARD (QUEUED, EXECUTED, CANCELLED)

### Edge Cases

1. **Missing Citizen Groups**: Some groups may have no votes
2. **Sparse Options**: Not all options have votes in all groups
3. **Different Timing**: Offchain may have different end time
