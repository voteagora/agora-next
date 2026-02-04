# APPROVAL Proposal Type

> **Source:** `dao_node` | **Voting Module:** `approval`

Multi-choice onchain approval voting where voters can approve multiple options.

---

## Example Data

```json
{
  "block_number": "142523823",
  "transaction_index": 35,
  "log_index": 138,
  "proposer": "0xe4553b743e74da3424ac51f8c1e586fd43ae226f",
  "voting_module": "0x8060b18290f48fc0bf2149eeb2f3c280bde7674f",
  "proposal_data": "00000000...",
  "start_block": 142523823,
  "end_block": 142783023,
  "proposal_type": 3,
  "id": "47939764654845104552261722485539617002410064905544331999528786700108507099119",
  "voting_module_name": "approval",
  "decoded_proposal_data": [
    [
      [0, [], [], [], "Agora"],
      [0, [], [], [], "Alchemy Insights, Inc."],
      [0, [], [], [], "Certora, Ltd."],
      [0, [], [], [], "Cyfrin"],
      [0, [], [], [], "Emiliano"],
      [0, [], [], [], "Gauntlet"],
      [0, [], [], [], "Lund Ventures"],
      [0, [], [], [], "Mariano"],
      [0, [], [], [], "pablito.eth"],
      [0, [], [], [], "Routescan"],
      [0, [], [], [], "Uniswap Foundation"],
      [0, [], [], [], "Velodrome"],
      [0, [], [], [], "Ξthernaut"]
    ],
    [13, 1, "0x0000000000000000000000000000000000000000", 7, 0]
  ],
  "totals": {
    "0": { "1": "35538355389398193048445174" },
    "1": { "1": "13235132909566200664986311" },
    "2": { "1": "5397766239707764388812984" },
    "3": { "1": "31179992667843397761823383" },
    "4": { "1": "28544757653174324418989153" },
    "5": { "1": "10977592652952732282030427" },
    "6": { "1": "9211568815816156103039649" },
    "7": { "1": "30465136465544547311678262" },
    "8": { "1": "30498075343416813626392337" },
    "9": { "1": "8477642055973075372955705" },
    "10": { "1": "28574944330657036601839171" },
    "11": { "1": "31720954765761711334746814" },
    "12": { "1": "13284945757517815590662964" }
  },
  "num_of_votes": 3867,
  "proposal_type_info": {
    "quorum": 3000,
    "approval_threshold": 5100,
    "name": "Default - Approval Voting",
    "module": null,
    "scopes": []
  },
  "hybrid": false,
  "after_start_block": false,
  "after_end_block": false,
  "start_blocktime": 1760646423,
  "title": "Security Council Elections Cohort A Members",
  "quorum": "25631045241056631270605358",
  "end_blocktime": 1761164823,
  "total_voting_power_at_start": "85436817470188770902017861",
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
source === "dao_node" && voting_module_name === "approval" && hybrid === false;
```

---

## Vote Totals Structure

```typescript
// Per-option vote totals (keyed by option index)
totals: {
  "0": { "1": string },   // Option 0 votes (wei)
  "1": { "1": string },   // Option 1 votes (wei)
  "2": { "1": string },   // Option 2 votes (wei)
  // ... etc
}
```

---

## Decoded Proposal Data Structure

```typescript
decoded_proposal_data: [
  // Array of options
  [
    [budgetSpent, targets[], values[], calldatas[], description],
    // ... more options
  ],
  // Settings array
  [
    maxOptions,           // Total number of options
    criteria,             // 1 = TOP_CHOICES, 99 = THRESHOLD
    budgetToken,          // Address or zero address
    criteriaValue,        // Number of winners (TOP_CHOICES) or threshold (THRESHOLD)
    budgetAmount          // Budget limit (0 if no budget)
  ]
]
```

---

## Criteria Types

| Criteria Value | Name        | Description                             |
| -------------- | ----------- | --------------------------------------- |
| 0              | THRESHOLD   | Options exceeding threshold win         |
| 1              | TOP_CHOICES | Top N options win (N = `criteriaValue`) |

---

## Status Determination

### Quorum Calculation

```typescript
// Using BigInt for precise vote calculations
const voteTotals = proposal.totals?.["no-param"] || {};
const forVotes = BigInt(voteTotals["1"] ?? "0");
const abstainVotes = BigInt(voteTotals["2"] ?? "0");

// Quorum for approval = for + abstain
const quorumVotes = forVotes + abstainVotes;

// Get quorum value (from proposal.quorum or total_voting_power_at_start / 3)
const quorumValue = getApprovalQuorum(proposal, decimals);

// Check quorum
if (convertToNumber(String(quorumVotes), decimals) < quorumValue) {
  return "DEFEATED";
}
```

### Criteria-Based Status

```typescript
// Extract approval metrics (includes criteria and choices)
const approvalMetrics = extractApprovalMetrics(proposal, {
  tokenDecimals: decimals,
});
const { choices, criteria, criteriaValue } = approvalMetrics;

// Criteria constants
const CRITERIA_THRESHOLD = 0; // Options must meet a threshold
const CRITERIA_TOP_CHOICES = 1; // Top N options win

if (criteria === CRITERIA_THRESHOLD) {
  // THRESHOLD: at least one option must exceed threshold votes
  const thresholdVotes = convertToNumber(String(criteriaValue), decimals);

  for (const choice of choices) {
    if (choice.approvals > thresholdVotes) {
      return "SUCCEEDED";
    }
  }
  return "DEFEATED";
} else {
  // TOP_CHOICES: Auto-succeeds if quorum met
  return "SUCCEEDED";
}
```

> **Note:** Raw criteria from `decoded_proposal_data` is numeric (0 = THRESHOLD, 1 = TOP_CHOICES). The criteriaValue represents either the threshold amount or the number of top choices to select.

---

## Key Fields

| Field                       | Type   | Description                     |
| --------------------------- | ------ | ------------------------------- |
| `voting_module`             | string | Approval voting module address  |
| `voting_module_name`        | string | Always `"approval"`             |
| `decoded_proposal_data`     | array  | Options and settings            |
| `totals`                    | object | Per-option vote counts          |
| `proposal_type_info.quorum` | number | Quorum threshold (basis points) |

---

## Option Result Extraction

```typescript
function extractOptionResults(
  decodedData: unknown[][],
  totals: Record<string, { "1": string }>
) {
  const [options, settings] = decodedData;
  const results = options.map((opt, index) => ({
    description: opt[4] as string,
    votes: BigInt(totals[index.toString()]?.["1"] || "0"),
    budgetSpent: BigInt(opt[0] as number),
  }));

  const [maxOptions, criteria, budgetToken, criteriaValue, budgetAmount] =
    settings;

  return {
    options: results,
    criteria: criteria === 1 ? "TOP_CHOICES" : "THRESHOLD",
    criteriaValue: Number(criteriaValue),
    budgetToken: budgetToken as string,
    budgetAmount: BigInt(budgetAmount as number),
  };
}
```

---

## Test Cases

### Status Tests

1. **DEFEATED - No Quorum**: `totalUniqueVotes < quorum`
2. **SUCCEEDED - TOP_CHOICES**: Quorum met, top N options identified
3. **SUCCEEDED - THRESHOLD**: At least one option exceeds threshold
4. **DEFEATED - THRESHOLD**: No options exceed threshold
5. **Terminal States**: Same as STANDARD (QUEUED, EXECUTED, CANCELLED)

### Edge Cases

1. **Tied Options**: Multiple options with same vote count
2. **Zero Votes on Option**: Should handle gracefully
3. **Budget Constraints**: Options may have budget limits
