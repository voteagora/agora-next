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

### Voter Groups

| Group     | Eligible Count                              | Source            |
| --------- | ------------------------------------------- | ----------------- |
| Delegates | `total_voting_power_at_start / 10^decimals` | dao_node totals   |
| APP       | `OFFCHAIN_THRESHOLDS.APP` = 100             | eas-atlas outcome |
| USER      | `OFFCHAIN_THRESHOLDS.USER` = 1000           | eas-atlas outcome |
| CHAIN     | `OFFCHAIN_THRESHOLDS.CHAIN` = 15            | eas-atlas outcome |

> Unlike HYBRID_APPROVAL, HYBRID_STANDARD uses the full votable supply (`total_voting_power_at_start`) as the delegate eligible count — not the quorum-derived value.

### Calculation Logic

```typescript
// 1. Resolve thresholds from the dao_node onchain proposal
const thresholds = resolveArchiveThresholds(proposal);
// thresholds.quorum: BigInt absolute value (from proposal.quorum)
// thresholds.approvalThreshold: BigInt basis points (e.g. 5100 = 51%)

// 2. Derive eligible delegates from total votable supply
const eligibleDelegates = proposal.total_voting_power_at_start
  ? convertToNumber(String(proposal.total_voting_power_at_start), decimals)
  : 1;

// 3. Extract onchain votes (dao_node totals["no-param"])
const voteTotals = proposal.totals?.["no-param"] || {};
const delegateFor = convertToNumber(String(voteTotals["1"] ?? 0), decimals);
const delegateAgainst = convertToNumber(String(voteTotals["0"] ?? 0), decimals);
const delegateAbstain = convertToNumber(String(voteTotals["2"] ?? 0), decimals);

// 4. Extract offchain votes from govless_proposal.outcome
const outcome = proposal.govless_proposal?.outcome ?? {};
const citizenVotes = (key: string) => ({
  user: Number(outcome.USER?.[key]?.["1"] ?? 0),
  app: Number(outcome.APP?.[key]?.["1"] ?? 0),
  chain: Number(outcome.CHAIN?.[key]?.["1"] ?? 0),
});

// 5. Compute weighted percentages (HYBRID_VOTE_WEIGHTS: delegates=0.5, each citizen=1/6)
function calcWeightedPct(delegateVotes, eligibleDelegates, citizen) {
  const delegatePct =
    eligibleDelegates > 0 ? (delegateVotes / eligibleDelegates) * 100 : 0;
  const userPct = (citizen.user / OFFCHAIN_THRESHOLDS.USER) * 100;
  const appPct = (citizen.app / OFFCHAIN_THRESHOLDS.APP) * 100;
  const chainPct = (citizen.chain / OFFCHAIN_THRESHOLDS.CHAIN) * 100;
  return (
    delegatePct * 0.5 +
    userPct * (1 / 6) +
    appPct * (1 / 6) +
    chainPct * (1 / 6)
  );
}

const forVotes = calcWeightedPct(
  delegateFor,
  eligibleDelegates,
  citizenVotes("1")
);
const againstVotes = calcWeightedPct(
  delegateAgainst,
  eligibleDelegates,
  citizenVotes("0")
);
const abstainVotes = calcWeightedPct(
  delegateAbstain,
  eligibleDelegates,
  citizenVotes("2")
);

// 6. Approval check (% of for vs for+against)
const thresholdVotes = forVotes + againstVotes;
const voteThresholdPercent =
  thresholdVotes > 0 ? (forVotes / thresholdVotes) * 100 : 0;
const hasMetThreshold =
  voteThresholdPercent >= Number(thresholds.approvalThreshold) / 100 ||
  Number(thresholds.approvalThreshold) === 0;

// 7. Quorum check (tenant-specific calculateQuorumNumber — applies to weighted %s)
const quorumVotes = calculateQuorumNumber(forVotes, againstVotes, abstainVotes);

// 8. Status: SUCCEEDED if EITHER threshold OR quorum is met (OR, not AND)
if (hasMetThreshold || quorumVotes >= Number(thresholds.quorum)) {
  return "SUCCEEDED";
}
return "DEFEATED";
```

> **Important:** The status uses an OR condition — a proposal passes if approval threshold OR quorum check is met.

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

1. **SUCCEEDED - Threshold Met**: `voteThresholdPercent >= approvalThreshold` (even if quorum not met)
2. **SUCCEEDED - Quorum Met**: `quorumVotes >= Number(thresholds.quorum)` (even if threshold not met)
3. **DEFEATED - Both Low**: Neither approval threshold nor quorum check is satisfied
4. **Terminal States**: Same as STANDARD (QUEUED, EXECUTED, CANCELLED)

### Calculation Tests

1. **Delegates Only**: No offchain votes; weighted pct is driven purely by `delegatePct * 0.5`
2. **Citizens Only**: `eligibleDelegates = 1` fallback when `rawQuorum = 0`
3. **Mixed**: Both delegate and citizen votes contribute to weighted percentage
4. **Edge Case - Zero eligibleDelegates**: Falls back to `1` to avoid division by zero
