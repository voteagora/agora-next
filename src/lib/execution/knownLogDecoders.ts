import { type Log, decodeEventLog, parseAbi } from "viem";

const KNOWN_EXECUTION_EVENT_ABI = parseAbi([
  "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)",
  "event Revoked(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Transfer(bytes32 indexed node, address owner)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event OwnerChanged(address indexed previousOwner, address indexed newOwner)",
  "event ExecuteTransaction(bytes32 indexed txHash, address indexed target, uint256 value, string signature, bytes data, uint256 eta)",
  "event SentMessage(address indexed target, address sender, bytes message, uint256 messageNonce, uint256 gasLimit)",
  "event SentMessageExtension1(address indexed sender, uint256 value)",
  "event TransactionDeposited(address indexed from, address indexed to, uint256 indexed version, bytes opaqueData)",
  "event ProposalExecuted(uint256 id)",
  "event TextChanged(bytes32 indexed node, string indexed key, string value)",
  "event MessageDelivered(uint256 indexed messageIndex, bytes32 indexed beforeInboxAcc, address bridge, uint8 kind, address sender, bytes32 l2DataHash, uint256 l1Block, uint64 timestamp)",
  "event InboxMessageDelivered(uint256 indexed messageNum, bytes data)",
  "event UpkeepPerformed(uint256 indexed id, bool indexed success, address indexed keeper, uint96 payment, bytes data)",
  "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
  "event Initialized(address indexed a, address indexed b, address indexed c, uint96 amount)",
  "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
  "event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner)",
  "event NewResolver(bytes32 indexed node, address resolver)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  "event Unpaused(address account)",
  "event LogMessagePublished(address indexed sender, uint64 sequence, uint32 sourceDomain, bytes message, uint8 attestationType)",
  "event MessageSent(bytes message, address indexed sender)",
  "event SafeHarborAdoption(address indexed safe, address newOwner, address newGuardian)",
  "event MetadataUpdate(uint256 id)",
  "event ProposalThresholdSet(uint256 oldThreshold, uint256 newThreshold)",
  "event Deposit(address indexed from, address indexed to, uint256 value)",
  "event FeeAmountEnabled(uint24 indexed fee, int24 indexed tickSpacing)",
  "event TransactionEnqueued(address indexed l1TxOrigin, address indexed l1Target, uint256 indexed queueIndex, bytes encodedData, uint256 t1, uint256 t2)",
  "event Dispatch(bytes32 indexed messageId, uint256 indexed destinationDomain, uint64 indexed sourceU64, bytes32 dataHash, bytes messageBody)",
  "event StateSynced(uint256 indexed id, address indexed contract, bytes data)",

  "event AddDelegate(address indexed, address)",
  "event AgreementStateUpdated(address indexed, address indexed, uint256)",
  "event AgreementUpdated(address agreement, bytes32 eventName, bytes32[] terms)",
  "event AlgorithmUpdated(uint8 id, address impl)",
  "event CallExecuted(bytes32 indexed id, uint256 indexed index, address target, uint256 value, bytes data)",
  "event ControllerAdded(address indexed)",
  "event ControllerChanged(address indexed, bool)",
  "event ControllerRemoved(address indexed)",
  "event DefaultResolverChanged(address indexed)",
  "event Deposit(address indexed dst, uint256 wad)",
  "event DisabledModule(address module)",
  "event EnabledModule(address module)",
  "event ExecutionSuccess(bytes32, uint256)",
  "event FlowUpdated(address indexed token, address indexed sender, address indexed receiver, int96 flowRate, int256 deposit, int256 owedDeposit, bytes userData)",
  "event FlowUpdatedExtension(address indexed, uint256)",
  "event InterfaceChanged(bytes32 indexed node, bytes4 indexed interfaceId, address implementer)",
  "event Minted(address indexed, address indexed, uint256, bytes, bytes)",
  "event NameChanged(bytes32 indexed node, string newName)",
  "event NameRegistered(uint256 indexed, address indexed, uint256)",
  "event NewPriceOracle(address indexed)",
  "event RegistrarAdded(address indexed)",
  "event ReverseClaimed(address indexed, bytes32 indexed)",
  "event RevokeTarget(uint16, address)",
  "event RoleGranted(bytes32 indexed, address indexed, address indexed)",
  "event SafeReceived(address indexed, uint256)",
  "event ScopeTarget(uint16, address)",
  "event ScopeRevokeFunction(uint16 scope, address target, bytes4 selector, uint256 expiry)",
  "event Sent(address indexed, address indexed, address indexed, uint256, bytes, bytes)",
  "event SetAllowance(address indexed, address, address, uint96, uint16)",
  "event TokenUpgraded(address indexed, uint256)",
  "event UpdatePodAdmin(uint256, address)",
  "event WrapScheduleCreated(bytes32 indexed, address indexed, address indexed, address, address, uint256, uint256, uint256)",

  "event AllowFunction(bytes32 roleKey, address targetAddress, bytes4 selector, uint8 options)",
  "event AllowTarget(bytes32 roleKey, address targetAddress, uint8 options)",
  "event AssignRoles(address module, bytes32[] roleKeys, bool[] memberOf)",
  "event AvatarSet(address indexed previousAvatar, address indexed newAvatar)",
  "event ConsumeAllowance(bytes32 allowanceKey, uint128 consumed, uint128 newBalance)",
  "event ExecutionFromModuleFailure(address indexed module)",
  "event ExecutionFromModuleSuccess(address indexed module)",
  "event HashExecuted(bytes32)",
  "event HashInvalidated(bytes32)",
  "event Initialized(uint64 version)",
  "event RevokeFunction(bytes32 roleKey, address targetAddress, bytes4 selector)",
  "event RevokeTarget(bytes32 roleKey, address targetAddress)",
  "event RolesModSetup(address indexed initiator, address indexed owner, address indexed avatar, address target)",
  "event ScopeFunction(bytes32 roleKey, address targetAddress, bytes4 selector, (uint8, uint8, uint8, bytes)[] conditions, uint8 options)",
  "event ScopeTarget(bytes32 roleKey, address targetAddress)",
  "event SetAllowance(bytes32 allowanceKey, uint128 balance, uint128 maxRefill, uint128 refill, uint64 period, uint64 timestamp)",
  "event SetDefaultRole(address module, bytes32 defaultRoleKey)",
  "event SetUnwrapAdapter(address to, bytes4 selector, address adapter)",
  "event TargetSet(address indexed previousTarget, address indexed newTarget)",

  "event AllowTarget(uint16 role, address targetAddress, uint8 options)",
  "event ScopeAllowFunction(uint16 role, address targetAddress, bytes4 selector, uint8 options, uint256 resultingScopeConfig)",
  "event ScopeFunction(uint16 role, address targetAddress, bytes4 functionSig, bool[] isParamScoped, uint8[] paramType, uint8[] paramComp, bytes[] compValue, uint8 options, uint256 resultingScopeConfig)",
  "event ScopeFunctionExecutionOptions(uint16 role, address targetAddress, bytes4 functionSig, uint8 options, uint256 resultingScopeConfig)",
  "event ScopeParameter(uint16 role, address targetAddress, bytes4 functionSig, uint256 index, uint8 paramType, uint8 paramComp, bytes compValue, uint256 resultingScopeConfig)",
  "event ScopeParameterAsOneOf(uint16 role, address targetAddress, bytes4 functionSig, uint256 index, uint8 paramType, bytes[] compValues, uint256 resultingScopeConfig)",
  "event ScopeRevokeFunction(uint16 role, address targetAddress, bytes4 selector, uint256 resultingScopeConfig)",
  "event UnscopeParameter(uint16 role, address targetAddress, bytes4 functionSig, uint256 index, uint256 resultingScopeConfig)",

  "event Transfer(address caller, address indexed sender, address indexed receiver, uint256 indexed id, uint256 amount)",
  "event Approval(address indexed owner, address indexed spender, uint256 indexed id, uint256 amount)",
  "event Withdraw(address indexed owner, address indexed token, address indexed withdrawer, uint256 amount, uint256 reward)",
  "event OperatorSet(address indexed owner, address indexed spender, bool approved)",
  "event NonceInvalidation(address indexed owner, uint256 indexed nonce)",
  "event EIP712DomainChanged()",
  "event WithdrawConfigUpdated(address indexed owner, (uint16 incentive, bool paused) config)",

  "event MinDelayChange(uint256, uint256)",

  "event SplitDistributed(address indexed token, address indexed distributor, uint256 amount)",
  "event SplitCreated(address indexed split, (address[] recipients, uint256[] allocations, uint256 totalAllocation, uint16 distributionIncentive) splitParams, address owner, address creator, uint256 nonce)",
  "event SplitCreated(address indexed split, (address[] recipients, uint256[] allocations, uint256 totalAllocation, uint16 distributionIncentive) splitParams, address owner, address creator, bytes32 salt)",
  "event SplitUpdated((address[] recipients, uint256[] allocations, uint256 totalAllocation, uint16 distributionIncentive) split)",
]);

export function tryDecodeKnownExecutionLog(log: Log): {
  eventName: string;
  args: readonly unknown[] | Record<string, unknown>;
} | null {
  try {
    const decoded = decodeEventLog({
      abi: KNOWN_EXECUTION_EVENT_ABI,
      data: log.data,
      topics: log.topics,
      strict: false,
    });

    if (!decoded.eventName) {
      return null;
    }

    return {
      eventName: decoded.eventName,
      args: decoded.args as readonly unknown[] | Record<string, unknown>,
    };
  } catch {
    return null;
  }
}
