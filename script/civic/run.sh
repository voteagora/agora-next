#!/usr/bin/env bash
set -euo pipefail

if [[ $# -gt 1 ]]; then
  echo "Usage: FORGE_ACCOUNT=<keystore-account-for-0xDF35...> BASE_RPC_URL=<rpc> $0 [--broadcast]"
  exit 1
fi

: "${FORGE_ACCOUNT:?Set FORGE_ACCOUNT to the Foundry keystore account for 0xDF35c8eC563e643EC7e37C7d66b881bdc77DaCBc}"
: "${BASE_RPC_URL:?Set BASE_RPC_URL to a Base mainnet RPC URL}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

if [[ ! -d lib/forge-std ]]; then
  forge install foundry-rs/forge-std --no-commit
fi

ARGS=(
  SetCivicProposalTypes.s.sol:SetCivicProposalTypes
  --rpc-url "${BASE_RPC_URL}"
  --account "${FORGE_ACCOUNT}"
  --chain-id 8453
)

if [[ "${1:-}" == "--broadcast" ]]; then
  ARGS+=(--broadcast)
else
  echo "Dry-run mode. Pass --broadcast to send transactions."
fi

forge script "${ARGS[@]}"
