# Delegation Statement Support for Safe Wallets

## Overview
This document outlines the implementation details for handling delegation statements with Safe wallets in the Agora platform.

## Background
Delegation statements are off-chain records validated using cryptographic signatures. They allow one address to delegate voting power or other permissions to another address.

## Implementation Details

### Standard EOA Wallets
For standard Externally Owned Accounts (EOAs):
1. User signs the delegation statement using their wallet
2. System verifies the signature immediately
3. Upon successful verification, the statement is updated to an active state

### Safe Wallet Integration Challenges

#### Signature Collection Process
For Safe wallets (formerly Gnosis Safe):
1. Signatures must be collected from multiple owners based on the Safe's threshold
2. The statement remains in a "draft" state during this collection period
3. There is no automatic notification when all required signatures are confirmed

#### Technical Limitations
- Safe transactions require a threshold of signatures before execution
- The platform cannot determine when all required signatures have been collected without manual polling
- Safe's off-chain signature aggregation happens outside our system

## Proposed Solution

### Draft State Management
- Keep delegation statements in "draft" state until confirmation
- Provide UI indicators showing pending signature status
- Allow manual verification once users believe all signatures are collected

### Monitoring Options
- Implement periodic polling of Safe transaction status
- Consider webhook integration if Safe provides such capabilities
- Allow manual triggering of verification checks

## Security Considerations
- Validate all signatures against the Safe's current configuration
- Ensure proper error handling for partial signature scenarios
- Implement timeouts for draft statements to prevent stale entries

## Future Improvements
- Explore direct integration with Safe's transaction service
- Consider implementing a notification system for threshold achievement
- Research options for real-time signature monitoring

---
*This document is subject to updates as the Safe wallet integration evolves.*
