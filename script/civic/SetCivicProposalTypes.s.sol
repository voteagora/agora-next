// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";

interface IAgoraGovernor {
  function setModuleApproval(address module, bool approved) external;
}

interface IProposalTypesConfigurator {
  function setProposalType(
    uint8 proposalTypeId,
    uint16 quorum,
    uint16 approvalThreshold,
    string memory name,
    string memory description,
    address module
  ) external;
}

/// @notice Sets Civic proposal types on the PTC. Same writes as /admin.
/// Only governor admin 0xDF35c8eC... can broadcast.
///
/// Dry-run:
///   FORGE_ACCOUNT=<keystore-account> BASE_RPC_URL=<rpc> ./run.sh
/// Broadcast:
///   FORGE_ACCOUNT=<keystore-account> BASE_RPC_URL=<rpc> ./run.sh --broadcast
contract SetCivicProposalTypes is Script {
  address internal constant GOVERNOR = 0x01015E27514ba64e3F2E8655C7cD5be08D2f40CC;
  address internal constant PROPOSAL_TYPES_CONFIGURATOR = 0xFa5b3Da3530d2353F0003E249B2C2aEA8FCea534;
  address internal constant GOV_ADMIN = 0xDF35c8eC563e643EC7e37C7d66b881bdc77DaCBc;
  address internal constant APPROVAL_VOTING_MODULE = 0xaAD4A4f8a78449C811bd91fCE54f644e669277b5;
  address internal constant OPTIMISTIC_MODULE = 0x559b7c8C9474b3A100B7759dAe5482b9510962dd;

  // PTC stores percent * 100 (10000 = 100%). Civic: 0/51, 25/51, 51/66.
  uint8 internal constant NO_QUORUM_PROPOSAL_TYPE_ID = 0;
  uint8 internal constant REQUIRES_QUORUM_PROPOSAL_TYPE_ID = 1;
  uint8 internal constant SUPERMAJORITY_PROPOSAL_TYPE_ID = 2;
  uint8 internal constant OPTIMISTIC_PROPOSAL_TYPE_ID = 3;
  uint8 internal constant APPROVAL_VOTING_PROPOSAL_TYPE_ID = 4;

  error WrongBroadcaster(address broadcaster);

  function run() external {
    IAgoraGovernor governor = IAgoraGovernor(GOVERNOR);
    IProposalTypesConfigurator ptc = IProposalTypesConfigurator(PROPOSAL_TYPES_CONFIGURATOR);

    vm.startBroadcast();
    (, address broadcaster,) = vm.readCallers();
    if (broadcaster != GOV_ADMIN) {
      revert WrongBroadcaster(broadcaster);
    }

    // Approve modules first - types with modules will fail without this
    governor.setModuleApproval(APPROVAL_VOTING_MODULE, true);
    governor.setModuleApproval(OPTIMISTIC_MODULE, true);

    ptc.setProposalType(
      NO_QUORUM_PROPOSAL_TYPE_ID,
      0,
      5_100,
      "No Quorum",
      "Basic proposal with no quorum and 51% approval",
      address(0)
    );

    ptc.setProposalType(
      REQUIRES_QUORUM_PROPOSAL_TYPE_ID,
      2_500,
      5_100,
      "Requires Quorum",
      "Basic proposal with 25% quorum and 51% approval",
      address(0)
    );

    ptc.setProposalType(
      SUPERMAJORITY_PROPOSAL_TYPE_ID,
      5_100,
      6_600,
      "Supermajority",
      "Basic proposal with 51% quorum and 66% approval",
      address(0)
    );

    ptc.setProposalType(
      OPTIMISTIC_PROPOSAL_TYPE_ID,
      0,
      0,
      "Optimistic",
      "Optimistic Module",
      OPTIMISTIC_MODULE
    );

    ptc.setProposalType(
      APPROVAL_VOTING_PROPOSAL_TYPE_ID,
      2_500,
      5_100,
      "Approval Voting",
      "Approval Voting Module",
      APPROVAL_VOTING_MODULE
    );

    vm.stopBroadcast();

    console.log("CIVIC proposal types configured");
    console.log("ProposalTypesConfigurator:", PROPOSAL_TYPES_CONFIGURATOR);
    console.log("No quorum proposal type:", NO_QUORUM_PROPOSAL_TYPE_ID);
    console.log("Requires quorum proposal type:", REQUIRES_QUORUM_PROPOSAL_TYPE_ID);
    console.log("Supermajority proposal type:", SUPERMAJORITY_PROPOSAL_TYPE_ID);
    console.log("Optimistic proposal type:", OPTIMISTIC_PROPOSAL_TYPE_ID);
    console.log("Approval voting proposal type:", APPROVAL_VOTING_PROPOSAL_TYPE_ID);
  }
}
