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
    "no-param": { "1": "55000000000000000000000000" },
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
// "no-param" aggregate used for quorum — key "1" = for, "0" = against, "2" = abstain
totals: {
  "no-param": { "1": string, "0"?: string, "2"?: string },  // Aggregate votes (wei)
  "0": { "1": string },  // Option 0 approval votes (wei)
  "1": { "1": string },  // Option 1 approval votes (wei)
  "2": { "1": string },  // Option 2 approval votes (wei)
  // ... etc
}

// For eas-oodao: votes are in outcome["no-param"] instead of totals["no-param"]
// For older dao_node proposals (decoded_proposal_data[0][0].length === 4):
// key "0" = for votes, "1" = abstain votes, "2" = against votes
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

Status is dispatched by proposal sub-type. All paths share `getApprovalQuorum` and `extractApprovalMetrics`.

### Quorum Resolver

```typescript
// Priority: proposal.quorum → proposal.quorumVotes → eas-oodao basis points → VP * 0.3
function getApprovalQuorum(proposal, decimals): number {
  if (proposal.quorum && Number(proposal.quorum) > 0)
    return convertToNumber(String(proposal.quorum), decimals);
  if (proposal.quorumVotes && Number(proposal.quorumVotes) > 0)
    return convertToNumber(String(proposal.quorumVotes), decimals);
  // eas-oodao: proposal_type.quorum is basis points of total VP
  if (isEasOodaoSource(proposal) && proposal.proposal_type?.quorum > 0)
    return totalVotingPower * (proposal.proposal_type.quorum / 10000);
  return totalVotingPower * 0.3; // fallback: 30%
}
```

---

### 1. OFFCHAIN_APPROVAL (eas-atlas)

Uses **unique voter count** (not vote weight) for quorum — one voter approving N options must not inflate participation.

```typescript
// Quorum: total unique voters vs. required voter count
const totalVoters = approvalMetrics.totalVoters || 0;
if (totalVoters < quorumValue) return "DEFEATED";

// Criteria check
if (criteria === CRITERIA_THRESHOLD) {
  const thresholdVotes = convertToNumber(String(criteriaValue), decimals);
  for (const choice of choices) {
    if (choice.approvals > thresholdVotes) return "SUCCEEDED";
  }
  return "DEFEATED";
}
return "SUCCEEDED"; // TOP_CHOICES: quorum met is enough
```

---

### 2. HYBRID_APPROVAL (dao_node + eas-atlas citizens)

Weighted participation across delegates and citizen house groups must reach 30%.

```typescript
const QUORUM_THRESHOLD = HYBRID_PROPOSAL_QUORUM * 100; // 30
const quorumRaw = Number(proposal.quorum || 0);

// Eligible voters per group
const eligibleDelegates =
  quorumRaw > 0 ? convertToNumber(String(quorumRaw), decimals) * (100 / 30) : 1;
// Citizen counts: APP = 100, USER = 1000, CHAIN = 15 (OFFCHAIN_THRESHOLDS)

// Delegate totals from onchain
const voteTotals = proposal.totals?.["no-param"] || {};
const delegateFor = convertToNumber(String(voteTotals["1"] ?? "0"), decimals);
const delegateAgainst = convertToNumber(
  String(voteTotals["0"] ?? "0"),
  decimals
);
const delegateTotal = delegateFor + delegateAgainst;

// Citizen votes: max votes any single option received per type
const outcome = proposal.govless_proposal?.outcome ?? {};
const citizenVoters = {
  apps: Math.max(
    0,
    ...Object.values(outcome.APP || {}).map((v) => Number(v["1"] ?? 0))
  ),
  users: Math.max(
    0,
    ...Object.values(outcome.USER || {}).map((v) => Number(v["1"] ?? 0))
  ),
  chains: Math.max(
    0,
    ...Object.values(outcome.CHAIN || {}).map((v) => Number(v["1"] ?? 0))
  ),
};

// Weighted unique participation (HYBRID_VOTE_WEIGHTS: delegates=0.5, each citizen=1/6)
let uniqueParticipation = 0;
uniqueParticipation += (delegateTotal / eligibleDelegates) * 100 * 0.5;
uniqueParticipation += (citizenVoters.apps / 100) * 100 * (1 / 6);
uniqueParticipation += (citizenVoters.users / 1000) * 100 * (1 / 6);
uniqueParticipation += (citizenVoters.chains / 15) * 100 * (1 / 6);

if (uniqueParticipation < QUORUM_THRESHOLD) return "DEFEATED";

// Criteria
if (criteria === CRITERIA_THRESHOLD) {
  const thresholdPct = Number(criteriaValue) / 10000; // criteriaValue in basis points
  for (const choice of choices) {
    let weightedPct = 0;
    // Sum weighted % per group for this option
    weightedPct +=
      (delegateVotes[choice.index] / eligibleDelegates) * 0.5 * 100;
    weightedPct += (appVotes[choice.index] / 100) * (1 / 6) * 100;
    weightedPct += (userVotes[choice.index] / 1000) * (1 / 6) * 100;
    weightedPct += (chainVotes[choice.index] / 15) * (1 / 6) * 100;
    if (weightedPct >= thresholdPct) return "SUCCEEDED";
  }
  return "DEFEATED";
}
return "SUCCEEDED"; // TOP_CHOICES: quorum met is enough
```

---

### 3. Standard APPROVAL (dao_node + eas-oodao)

```typescript
// eas-oodao uses outcome["no-param"], dao_node uses totals["no-param"]
const voteTotals = isEasOodaoSource(proposal)
  ? (proposal.outcome as Record<string, Record<string, string>>)?.[
      "no-param"
    ] || {}
  : proposal.totals?.["no-param"] || {};

// Older dao_node format: decoded_proposal_data[0][0].length === 4 swaps key order
// Older: "0"=for, "1"=abstain, "2"=against
// Newer: "1"=for, "2"=abstain, "0"=against
const isOlderFormat =
  isDaoNodeSource(proposal) &&
  Array.isArray(proposal.decoded_proposal_data?.[0]?.[0]) &&
  proposal.decoded_proposal_data[0][0].length === 4;

const forVotes = BigInt(voteTotals[isOlderFormat ? "0" : "1"] ?? "0");
const abstainVotes = BigInt(voteTotals[isOlderFormat ? "1" : "2"] ?? "0");
const againstVotes = BigInt(voteTotals[isOlderFormat ? "2" : "0"] ?? "0");

// Quorum uses ALL votes (for + abstain + against)
const quorumVotes = forVotes + abstainVotes + againstVotes;

if (
  convertToNumber(String(quorumVotes), decimals) < quorumValue &&
  quorumValue > 0
) {
  return "DEFEATED";
}

// Criteria
if (criteria === CRITERIA_THRESHOLD) {
  const thresholdVotes = convertToNumber(String(criteriaValue), decimals);
  for (const choice of choices) {
    if (choice.approvals > thresholdVotes) return "SUCCEEDED";
  }
  return "DEFEATED";
} else {
  // TOP_CHOICES: quorum met → auto-succeed
  return "SUCCEEDED";
}
```

> **Note:** Criteria constants — `CRITERIA_THRESHOLD = 0`, `CRITERIA_TOP_CHOICES = 1`. The `criteriaValue` represents either the token threshold (THRESHOLD) or the number of winners (TOP_CHOICES).

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

### APPROVAL (dao_node) Status Tests

1. **DEFEATED - No Quorum**: `quorumVotes < quorum` (all 3 vote types summed)
2. **SUCCEEDED - TOP_CHOICES**: Quorum met, criteria = 1
3. **SUCCEEDED - THRESHOLD**: Quorum met + at least one option exceeds threshold
4. **DEFEATED - THRESHOLD**: Quorum met + no options exceed threshold
5. **Terminal States**: Same as STANDARD (QUEUED, EXECUTED, CANCELLED)

### OFFCHAIN_APPROVAL Status Tests

1. **DEFEATED - No Quorum**: `totalVoters < quorumValue` (unique voter count)
2. **SUCCEEDED - TOP_CHOICES**: Voter count meets quorum, criteria = TOP_CHOICES
3. **SUCCEEDED - THRESHOLD**: Voter quorum met + option exceeds threshold
4. **DEFEATED - THRESHOLD**: Voter quorum met + no options meet threshold

### HYBRID_APPROVAL Status Tests

1. **DEFEATED - No Weighted Quorum**: `uniqueParticipation < 30`
2. **SUCCEEDED - TOP_CHOICES**: Weighted quorum met
3. **SUCCEEDED - THRESHOLD**: Weighted quorum + option weighted % meets threshold
4. **DEFEATED - THRESHOLD**: Weighted quorum + no option meets threshold

### Edge Cases

1. **Older Format**: `decoded_proposal_data[0][0].length === 4` swaps vote key mapping
2. **Zero Quorum**: `quorumValue = 0` skips quorum check
3. **Missing Options**: Some options may have no votes
