# Proposal System Migration Guide

This document explains how to use the new domain-driven proposal architecture and migrate from the legacy system.

## Environment Configuration

The migration is controlled by environment variables in `.env.local`:

```bash
# Enable the new domain-driven proposal architecture
USE_NEW_PROPOSAL_SYSTEM=false

# Percentage of traffic to route to new system (0-100)
NEW_SYSTEM_PERCENTAGE=0

# Enable comparison logging between old and new systems
ENABLE_SYSTEM_COMPARISON=false

# Log level for proposal system debugging (error, warn, info, debug)
PROPOSAL_SYSTEM_LOG_LEVEL=info
```

## Migration Phases

### Phase 1: Testing (0% traffic)
```bash
USE_NEW_PROPOSAL_SYSTEM=true
NEW_SYSTEM_PERCENTAGE=0
ENABLE_SYSTEM_COMPARISON=true
PROPOSAL_SYSTEM_LOG_LEVEL=debug
```
- New system is loaded but no traffic is routed to it
- Enables logging and monitoring setup
- Perfect for local development and testing

### Phase 2: Initial Rollout (10% traffic)
```bash
USE_NEW_PROPOSAL_SYSTEM=true
NEW_SYSTEM_PERCENTAGE=10
ENABLE_SYSTEM_COMPARISON=true
PROPOSAL_SYSTEM_LOG_LEVEL=info
```
- 10% of requests use the new system
- 90% use the old system as fallback
- Monitor logs for any errors or discrepancies

### Phase 3: Expanded Rollout (50% traffic)
```bash
USE_NEW_PROPOSAL_SYSTEM=true
NEW_SYSTEM_PERCENTAGE=50
ENABLE_SYSTEM_COMPARISON=true
PROPOSAL_SYSTEM_LOG_LEVEL=warn
```
- After 48+ hours of successful 10% operation
- Monitor performance and accuracy

### Phase 4: Full Rollout (100% traffic)
```bash
USE_NEW_PROPOSAL_SYSTEM=true
NEW_SYSTEM_PERCENTAGE=100
ENABLE_SYSTEM_COMPARISON=false
PROPOSAL_SYSTEM_LOG_LEVEL=error
```
- After 1+ week of successful 50% operation
- New system handles all traffic
- Old system serves as fallback only

### Phase 5: Legacy Cleanup
- After 2+ weeks of stable 100% operation
- Remove old `parseProposal` logic
- Clean up legacy code

## Monitoring and Metrics

### Real-time Metrics Endpoint
```bash
GET /api/v1/admin/proposal-system-metrics
```

Returns:
```json
{
  "timestamp": "2024-06-28T14:30:00.000Z",
  "config": {
    "useNewSystem": true,
    "newSystemPercentage": 10,
    "enableSystemComparison": true,
    "logLevel": "info"
  },
  "metrics": {
    "newSystemUsage": 45,
    "oldSystemUsage": 405,
    "fallbackCount": 2,
    "errors": 1,
    "total": 450,
    "newSystemPercentage": 10.0,
    "errorRate": 0.22,
    "fallbackRate": 4.44,
    "uptime": 3600000
  }
}
```

### Log Format
```
[ProposalSystem] New system usage {"tenant":"optimism","proposalId":"123","proposalType":"HYBRID_STANDARD","isHybrid":true,"timestamp":1719584400000}

[ProposalSystem] Fallback to old system {"tenant":"optimism","proposalId":"456","error":"Invalid proposal data","timestamp":1719584401000}

[ProposalSystem] System comparison data {"tenant":"optimism","totalProposals":25,"newSystemPercentage":10,"timestamp":1719584402000}
```

## Safety Features

### 1. Automatic Fallback
- Any error in the new system automatically falls back to the old system
- Zero risk of breaking existing functionality
- All fallbacks are logged and tracked

### 2. Percentage Control
- Traffic is randomly distributed based on `NEW_SYSTEM_PERCENTAGE`
- Can be adjusted in real-time without deployment
- Set to 0 for instant rollback

### 3. Error Tracking
- All errors are logged with context
- Metrics track error rates and fallback rates
- Easy to identify and debug issues

### 4. Feature Flag Override
- `USE_NEW_PROPOSAL_SYSTEM=false` completely disables new system
- Instant rollback capability
- No performance impact when disabled

## Troubleshooting

### High Error Rate
1. Check logs for specific error messages
2. Verify environment configuration
3. Set `NEW_SYSTEM_PERCENTAGE=0` to stop new system usage
4. Investigate errors and fix issues

### Calculation Discrepancies
1. Enable `ENABLE_SYSTEM_COMPARISON=true`
2. Set `PROPOSAL_SYSTEM_LOG_LEVEL=debug`
3. Compare old vs new system outputs
4. Check tenant-specific configuration

### Performance Issues
1. Monitor metrics endpoint for slow responses
2. Check memory usage and database queries
3. Reduce `NEW_SYSTEM_PERCENTAGE` if needed

## Development

### Local Testing
```bash
# Enable new system for 100% of local traffic
USE_NEW_PROPOSAL_SYSTEM=true
NEW_SYSTEM_PERCENTAGE=100
ENABLE_SYSTEM_COMPARISON=true
PROPOSAL_SYSTEM_LOG_LEVEL=debug
```

### Running Specific Tests
```bash
# Test hybrid proposals
curl "http://localhost:3000/api/common/proposals?filter=relevant" \
  -H "Accept: application/json"

# Monitor metrics
curl "http://localhost:3000/api/v1/admin/proposal-system-metrics" \
  -H "Accept: application/json"
```

## Support

- Logs are available in application console
- Metrics endpoint provides real-time monitoring
- All configuration changes take effect immediately
- Contact team for issues or questions