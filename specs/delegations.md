# Delegations Specification

## Overview

This document outlines the comprehensive delegation system implemented in Agora Next, covering delegation models, types, advanced features, and tenant-specific configurations.

## Delegation Models

The system supports three primary delegation models defined in `/src/lib/constants.ts`:

```typescript
export enum DELEGATION_MODEL {
  FULL = "FULL",         // Standard full delegation
  ADVANCED = "ADVANCED", // Advanced delegation with subdelegation
  PARTIAL = "PARTIAL",   // Native partial delegation
}
```

## Delegation Types

### 1. DIRECT Delegation

**Description**: Standard ERC20/ERC721 token delegation where voting power is fully delegated to a single address.

**Characteristics**:
- Uses token contract's native `delegate()` function
- All-or-nothing delegation model
- One delegator can only delegate to one delegatee
- Tracked as `type: "DIRECT"` and `amount: "FULL"`

**Use Cases**:
- Simple delegation for passive token holders
- Traditional liquid democracy implementation
- Default for most ERC20 governance tokens

**Contract Interaction**:
```solidity
token.delegate(delegateeAddress)
```

### 2. ADVANCED Delegation (Alligator)

**Description**: Sophisticated delegation system using the Alligator proxy contract, primarily used by Optimism.

**Key Features**:

#### Subdelegation Chains
- Delegatees can further delegate to others
- Creates delegation trees/chains
- Maintains authority rules through the chain

#### Allowance Control
- **Relative**: Percentage of received voting power (e.g., 50%)
- **Absolute**: Fixed token amount regardless of received power

#### Time Restrictions
- `notValidBefore`: Delegation activates after timestamp
- `notValidAfter`: Delegation expires at timestamp
- Useful for temporary delegations

#### Redelegation Limits
- `maxRedelegations`: Controls delegation chain depth
- Prevents infinite delegation chains
- Default varies by implementation

#### Vote Timing Rules
- `blocksBeforeVoteCloses`: Must vote X blocks before proposal ends
- Prevents last-minute vote changes
- Ensures delegate accountability

#### Custom Rules
- `customRule`: Contract address for custom validation
- Enables complex delegation logic
- Examples: Delegate only for specific proposal types

**Data Structure**:
```typescript
export type AuthorityChainRules = {
  allowance: number;                    // Amount delegated
  allowance_type: number;              // 0 = relative, 1 = absolute
  custom_rule: string;                 // Custom rule contract
  not_valid_after: number;            // Expiration timestamp
  not_valid_before: number;           // Activation timestamp
  max_redelegations: number;          // Chain depth limit
  blocks_before_vote_closes: number;  // Vote timing restriction
};
```

### 3. PARTIAL Delegation

**Description**: Native partial delegation allowing voting power to be split across multiple delegates.

**Characteristics**:
- Delegate percentages to multiple addresses
- No external proxy contract required
- Native support in token contract
- Used by Scroll, Linea, Derive

**Example Distribution**:
- 40% to Delegate A
- 35% to Delegate B  
- 25% retained by delegator

**UI Features**:
- Percentage allocation interface
- Visual distribution display
- Real-time calculation updates

## Core Data Structures

### Delegation Record

```typescript
export type Delegation = {
  from: string;           // Delegator address
  to: string;            // Delegatee address
  allowance: string;     // Amount or percentage delegated
  percentage: string;    // Percentage (for partial delegation)
  timestamp: Date | null; // When delegation occurred
  type: "DIRECT" | "ADVANCED";
  amount: "FULL" | "PARTIAL";
  transaction_hash: string;
  
  // Advanced delegation fields
  authorityChain?: AuthorityChain[];
  rules?: AuthorityChainRules;
};
```

### Authority Chain

```typescript
export type AuthorityChain = {
  address: string;
  voting_power: bigint;
  allowance: bigint;
  allowance_type: number;
  rules: AuthorityChainRules;
};
```

## Special Features

### 1. Sponsored Delegation

**Description**: Gas-free delegation using meta-transactions and EIP-712 signatures.

**Implementation**:
- User signs delegation message off-chain
- Sponsor submits transaction on-chain
- Uses `delegateBySig` with nonce and expiry

**Hook**: `useSponsoredDelegation`

**Benefits**:
- Removes gas barrier for delegation
- Increases participation
- Better UX for new users

### 2. Smart Contract Wallet (SCW) Support

**Description**: Special handling for smart contract wallets using account abstraction.

**Features**:
- Dedicated UI components (`ScwPartialDelegationButton`)
- ERC-4337 user operations
- Different transaction flow
- Analytics tracking for SCW vs EOA

### 3. Delegation Statements

**Description**: Public statements about delegation philosophy and voting intentions.

**Implementation**:
- Stored in database with signature verification
- Displayed on delegate profiles
- Helps delegators make informed decisions
- Supports markdown formatting

**Fields**:
- Statement text
- Signature for verification
- Timestamp
- Update history

### 4. Delegation Tracking & Analytics

**Features**:
- Full historical tracking of delegation events
- Authority chain visualization
- Delegation metrics and statistics
- "Delegation encouragement" features

**Analytics Events**:
```typescript
DELEGATE                      // Standard delegation
ADVANCED_DELEGATE            // Alligator delegation
PARTIAL_DELEGATION          // Partial delegation
DELEGATION_ENCOURAGEMENT_CTA // Engagement tracking
UNDELEGATE                  // Delegation removal
```

## Tenant-Specific Configurations

### Delegation Models by Tenant

| Tenant | Model | Features |
|--------|-------|----------|
| Optimism | ADVANCED | Alligator, subdelegation, advanced rules |
| ENS | FULL | Standard delegation only |
| Uniswap | FULL | Standard delegation only |
| Cyber | FULL | Standard delegation only |
| Scroll | PARTIAL | Native partial delegation |
| Linea | PARTIAL | Native partial delegation |
| Derive | PARTIAL | Native partial delegation |

### Special Configurations

#### Optimism
- Full Alligator integration
- Subdelegation UI
- Authority chain visualization
- Custom rule support
- Sponsored delegation

#### Scroll/Linea/Derive
- Percentage-based delegation UI
- Multi-delegate support
- Native contract integration
- No proxy contracts

## UI Components

### Core Dialogs

1. **DelegateDialog**
   - Standard delegation interface
   - Single delegatee selection
   - ENS name resolution
   - Transaction confirmation

2. **AdvancedDelegateDialog**
   - Alligator-based subdelegation
   - Rule configuration
   - Allowance settings
   - Time restrictions

3. **PartialDelegateDialog**
   - Percentage allocation interface
   - Multi-delegate management
   - Visual distribution
   - Real-time validation

4. **UndelegateDialog**
   - Remove existing delegations
   - Clear delegation chains
   - Reset to self-delegation

### Display Components

- `DelegationStatus`: Current delegation state
- `DelegateChainView`: Authority chain visualization
- `DelegationHistory`: Historical delegation events
- `DelegateStatement`: Philosophy display

## Delegation Flow

### Standard Delegation Flow

1. User selects delegatee (address/ENS)
2. System checks current delegation status
3. User confirms transaction
4. Execute `delegate()` on token contract
5. Track event and update UI

### Advanced Delegation Flow

1. User selects delegatee
2. Configure delegation rules:
   - Allowance (percentage/absolute)
   - Time restrictions
   - Redelegation limits
   - Custom rules
3. Sign subdelegation on Alligator
4. Create authority chain entry
5. Track and display chain

### Partial Delegation Flow

1. User opens partial delegation interface
2. Add delegates and assign percentages
3. Validate total equals 100%
4. Execute batch delegation transaction
5. Update delegation distribution display

## Best Practices

### For Delegators

1. **Research Delegates**: Review voting history and statements
2. **Set Appropriate Rules**: Use time limits and allowances wisely
3. **Monitor Activity**: Track how delegates use your voting power
4. **Update Regularly**: Adjust delegations based on performance

### For Delegates

1. **Publish Statements**: Clearly communicate voting philosophy
2. **Stay Active**: Participate in all relevant votes
3. **Communicate**: Explain significant votes to delegators
4. **Respect Limits**: Honor subdelegation restrictions

### For Developers

1. **Check Delegation Model**: Use appropriate UI/logic for tenant
2. **Validate Rules**: Ensure all constraints are enforced
3. **Handle Edge Cases**: Account for delegation chains and cycles
4. **Track Analytics**: Monitor delegation patterns and issues

## Security Considerations

### Delegation Risks

1. **Delegation Attacks**: Malicious delegates accumulating power
2. **Chain Exploits**: Deep subdelegation chains causing issues
3. **Time-based Attacks**: Exploiting delegation expiration
4. **Front-running**: MEV attacks on delegation transactions

### Mitigations

1. **Chain Depth Limits**: Enforce maximum redelegation levels
2. **Time Buffers**: Require delegations before vote start
3. **Allowance Caps**: Limit subdelegation percentages
4. **Monitoring**: Track unusual delegation patterns
5. **Revocation**: Easy undelegation mechanisms

## Future Enhancements

### Potential Features

1. **Delegation Rewards**: Incentivize active delegation
2. **Delegation Pools**: Collective delegation mechanisms
3. **Cross-chain Delegation**: Delegate across multiple chains
4. **Conditional Delegation**: Rules based on proposal types
5. **Delegation DAOs**: Collective delegate entities