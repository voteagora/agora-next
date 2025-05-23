import type { Block, Provider } from "ethers";
import type { Address } from "viem";
import { GOVERNOR_TYPE } from "../constants";
import { TenantContract } from "../tenant/tenantContract";
import { IGovernorContract } from "../contracts/common/interfaces/IGovernorContract";
import { ITimelockContract } from "../contracts/common/interfaces/ITimelockContract";
import { Proposal } from "@/app/api/common/proposals/proposal";

export interface ApprovalProposalOption {
  budgetTokensSpent: bigint;
  targets: string[];
  values: bigint[];
  calldatas: string[];
  description: string;
}

export interface ApprovalProposalSettings {
  maxApprovals: number;
  criteria: number;
  budgetToken: string;
  criteriaValue: bigint;
  budgetAmount: bigint;
}

// --- Simulation configurations ---

interface SimulationConfigBase {
  governorAddress: string; // address of the governor
  governorType: GOVERNOR_TYPE;
}

export interface SimulationConfigProposed extends SimulationConfigBase {
  proposal: Proposal;
  proposalId: string;
}

export interface SimulationConfigNew extends SimulationConfigBase {
  targets: string[];
  values: bigint[];
  signatures: string[];
  calldatas: string[];
  description: string;
}

export interface SimulationConfigNewApproval {
  governorType: GOVERNOR_TYPE;
  unformattedProposalData: string;
  description: string;
  moduleAddress: `0x${string}`;
  options: ApprovalProposalOption[];
  settings: ApprovalProposalSettings;
  combination?: number[];
  totalNumOfOptions?: number;
}

export interface SimulationResult {
  sim: TenderlySimulation;
  proposal?: ProposalEvent;
  deps: ProposalData;
  latestBlock: Block;
}

export interface SimulationData extends SimulationResult {
  config: SimulationConfigProposed | SimulationConfigNew;
}

// --- Proposal checks ---
export type ProposalActions = [
  // defined as an array instead of an object because the return data from governor.getActions()
  // has no `values` key if all values are zero
  string[],
  bigint[],
  string[],
  string[],
];

// TODO If adding support for a third governor, instead of hardcoding optional governor-specific
// fields, make this a union type of each governor's individual proposal type.
export interface ProposalStruct {
  id: bigint;
  proposer?: string;
  eta: bigint;
  startBlock?: bigint; // Compound governor
  startTime?: bigint; // OZ governor
  endBlock?: bigint; // Compound governor
  endTime?: bigint; // OZ governor
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  canceled: boolean;
  executed: boolean;
}

export interface ProposalEvent {
  id?: bigint; // Bravo governor
  proposalId?: bigint; // OZ governor
  proposer: string;
  startBlock: bigint;
  endBlock: bigint;
  description: string;
  title?: string;
  targets: string[];
  values: bigint[];
  signatures: string[];
  calldatas: string[];
}

export type Message = string;

export type CheckResult = {
  info: Message[];
  warnings: Message[];
  errors: Message[];
};

export type ProposalData = {
  governor: TenantContract<IGovernorContract>;
  timelock: TenantContract<ITimelockContract>;
  provider: Provider;
};

export interface ProposalCheck {
  name: string;
  checkProposal(
    proposal: ProposalEvent,
    tx: TenderlySimulation,
    deps: ProposalData
  ): Promise<CheckResult>;
}

export interface AllCheckResults {
  [checkId: string]: { name: string; result: CheckResult };
}

// --- Tenderly types, Request ---
// Response from tenderly endpoint that encodes state data
export type StorageEncodingResponse = {
  stateOverrides: {
    // these keys are the contract addresses, all lower case
    [key: string]: {
      value: {
        // these are the slot numbers, as 32 byte hex strings
        [key: string]: string;
      };
    };
  };
};

type StateObject = {
  balance?: string;
  code?: string;
  storage?: Record<string, string>;
};

type ContractObject = {
  contractName: string;
  source: string;
  sourcePath: string;
  compiler: {
    name: "solc";
    version: string;
  };
  networks: Record<
    string,
    {
      events?: Record<string, string>;
      links?: Record<string, string>;
      address: string;
      transactionHash?: string;
    }
  >;
};

export type TenderlyPayload = {
  network_id: string;
  block_number?: number;
  transaction_index?: number;
  from: string;
  to: string;
  input: string;
  gas: number;
  gas_price?: string;
  value?: string;
  simulation_type?: "full" | "quick";
  save?: boolean;
  save_if_fails?: boolean;
  state_objects?: Record<string, StateObject>;
  contracts?: ContractObject[];
  block_header?: {
    number?: string;
    timestamp?: string;
  };
  generate_access_list?: boolean;
};

// --- Tenderly types, Response ---
// NOTE: These type definitions were autogenerated using https://app.quicktype.io/, so are almost
// certainly not entirely accurate (and they have some interesting type names)

export interface TenderlySimulation {
  transaction: Transaction;
  simulation: Simulation;
  contracts: TenderlyContract[];
  generated_access_list: GeneratedAccessList[];
  asset_changes?: AssetChange[] | null;
  balance_changes?: BalanceChange[] | null;
}

export interface AssetChange {
  token_info: {
    standard: string;
    type: "Native" | string;
    symbol: string;
    name: string;
    logo: string;
    decimals: number;
    dollar_value: string;
  };
  type: string;
  from: string;
  to: string;
  amount: string;
  raw_amount: string;
  dollar_value: string;
}

export interface BalanceChange {
  address: string;
  dollar_value: string;
  transfers: number[];
}

export interface TenderlyContract {
  id: string;
  contract_id: string;
  balance: string;
  network_id: string;
  public: boolean;
  boolean: any;
  verified_by: string;
  verification_date: null;
  address: string;
  contract_name: string;
  ens_domain: null;
  type: string;
  evm_version: string;
  compiler_version: string;
  optimizations_used: boolean;
  optimization_runs: number;
  libraries: null;
  data: Data;
  creation_block: number;
  creation_tx: string;
  creator_address: string;
  created_at: Date;
  number_of_watches: null;
  language: string;
  in_project: boolean;
  number_of_files: number;
  standard?: string;
  standards?: string[];
  token_data?: TokenData;
}

interface Data {
  main_contract: number;
  contract_info: ContractInfo[];
  abi: ABI[];
  raw_abi: null;
}

interface ABI {
  type: ABIType;
  name: string;
  constant: boolean;
  anonymous: boolean;
  inputs: SoltypeElement[];
  outputs: Output[] | null;
}

interface SoltypeElement {
  name: string;
  type: SoltypeType;
  storage_location: StorageLocation;
  components: SoltypeElement[] | null;
  offset: number;
  index: string;
  indexed: boolean;
  simple_type?: Type;
}

interface Type {
  type: SimpleTypeType;
}

enum SimpleTypeType {
  Address = "address",
  Bool = "bool",
  Bytes = "bytes",
  Slice = "slice",
  String = "string",
  Uint = "uint",
}

enum StorageLocation {
  Calldata = "calldata",
  Default = "default",
  Memory = "memory",
  Storage = "storage",
}

enum SoltypeType {
  Address = "address",
  Bool = "bool",
  Bytes32 = "bytes32",
  MappingAddressUint256 = "mapping (address => uint256)",
  MappingUint256Uint256 = "mapping (uint256 => uint256)",
  String = "string",
  Tuple = "tuple",
  TypeAddress = "address[]",
  TypeTuple = "tuple[]",
  Uint16 = "uint16",
  Uint256 = "uint256",
  Uint48 = "uint48",
  Uint56 = "uint56",
  Uint8 = "uint8",
}

interface Output {
  name: string;
  type: SoltypeType;
  storage_location: StorageLocation;
  components: SoltypeElement[] | null;
  offset: number;
  index: string;
  indexed: boolean;
  simple_type?: SimpleType;
}

interface SimpleType {
  type: SimpleTypeType;
  nested_type?: Type;
}

enum ABIType {
  Constructor = "constructor",
  Event = "event",
  Function = "function",
}

interface ContractInfo {
  id: number;
  path: string;
  name: string;
  source: string;
}

interface TokenData {
  symbol: string;
  name: string;
  decimals: number;
}

interface GeneratedAccessList {
  address: string;
  storage_keys: string[];
}

interface Simulation {
  id: string;
  project_id: string;
  owner_id: string;
  network_id: string;
  block_number: number;
  transaction_index: number;
  from: string;
  to: string;
  input: string;
  gas: number;
  gas_price: string;
  value: string;
  method: string;
  status: boolean;
  access_list: null;
  queue_origin: string;
  created_at: Date;
}

interface Transaction {
  hash: Address;
  block_hash: string;
  block_number: number;
  from: Address;
  gas: number;
  gas_price: number;
  gas_fee_cap: number;
  gas_tip_cap: number;
  cumulative_gas_used: number;
  gas_used: number;
  effective_gas_price: number;
  input: string;
  nonce: number;
  to: Address;
  index: number;
  value: string;
  access_list: null;
  status: boolean;
  addresses: string[];
  contract_ids: string[];
  network_id: string;
  function_selector: string;
  transaction_info: TransactionInfo;
  timestamp: Date;
  method: string;
  decoded_input: null;
}

interface TransactionInfo {
  contract_id: string;
  block_number: number;
  transaction_id: Address;
  contract_address: Address;
  method: string;
  parameters: null;
  intrinsic_gas: number;
  refund_gas: number;
  call_trace: CallTrace;
  stack_trace: null | StackTrace[];
  logs: Log[] | null;
  state_diff: StateDiff[];
  raw_state_diff: null;
  console_logs: null;
  created_at: Date;
  asset_changes: AssetChange[] | null;
  balance_changes: BalanceChange[] | null;
}

interface StackTrace {
  file_index: number;
  contract: string;
  name: string;
  line: number;
  error: string;
  error_reason: string;
  code: string;
  op: string;
  length: number;
}

interface CallTrace {
  hash: Address;
  contract_name: string;
  function_name: string;
  function_pc: number;
  function_op: string;
  function_file_index: number;
  function_code_start: number;
  function_line_number: number;
  function_code_length: number;
  function_states: CallTraceFunctionState[];
  caller_pc: number;
  caller_op: string;
  call_type: string;
  error_reason: string;
  from: Address;
  from_balance: string;
  to: Address;
  to_balance: string;
  value: string;
  caller: Caller;
  block_timestamp: Date;
  gas: number;
  gas_used: number;
  intrinsic_gas: number;
  input: string;
  decoded_input: Input[];
  state_diff: StateDiff[];
  logs: Log[];
  output: string;
  decoded_output: FunctionVariableElement[];
  network_id: string;
  calls: CallTraceCall[];
}

interface Caller {
  address: Address;
  balance: string;
}

interface CallTraceCall {
  hash: string;
  contract_name: string;
  function_name: string;
  function_pc: number;
  function_op: string;
  function_file_index: number;
  function_code_start: number;
  function_line_number: number;
  function_code_length: number;
  function_states: CallTraceFunctionState[];
  function_variables: FunctionVariableElement[];
  caller_pc: number;
  caller_op: string;
  caller_file_index: number;
  caller_line_number: number;
  caller_code_start: number;
  caller_code_length: number;
  call_type: string;
  from: Address;
  from_balance: null;
  to: Address;
  to_balance: null;
  value: null;
  caller: Caller;
  block_timestamp: Date;
  gas: number;
  gas_used: number;
  input: string;
  decoded_input: Input[];
  output: string;
  decoded_output: FunctionVariableElement[];
  network_id: string;
  calls: PurpleCall[];
}

interface PurpleCall {
  hash: string;
  contract_name: string;
  function_name: string;
  function_pc: number;
  function_op: string;
  function_file_index: number;
  function_code_start: number;
  function_line_number: number;
  function_code_length: number;
  function_states?: FluffyFunctionState[];
  function_variables?: FunctionVariable[];
  caller_pc: number;
  caller_op: string;
  caller_file_index: number;
  caller_line_number: number;
  caller_code_start: number;
  caller_code_length: number;
  call_type: string;
  from: Address;
  from_balance: null | string;
  to: Address;
  to_balance: null | string;
  value: null | string;
  caller: Caller;
  block_timestamp: Date;
  gas: number;
  gas_used: number;
  refund_gas?: number;
  input: string;
  decoded_input: Input[];
  output: string;
  decoded_output: FunctionVariable[] | null;
  network_id: string;
  calls: FluffyCall[] | null;
}

export interface FluffyCall {
  hash: string;
  contract_name: string;
  function_name?: string;
  function_pc: number;
  function_op: string;
  function_file_index?: number;
  function_code_start?: number;
  function_line_number?: number;
  function_code_length?: number;
  function_states?: FluffyFunctionState[];
  function_variables?: FunctionVariable[];
  caller_pc: number;
  caller_op: string;
  caller_file_index: number;
  caller_line_number: number;
  caller_code_start: number;
  caller_code_length: number;
  call_type: string;
  from: string;
  from_balance: null | string;
  to: string;
  to_balance: null | string;
  value: null | string;
  caller?: Caller;
  block_timestamp: Date;
  gas: number;
  gas_used: number;
  input: string;
  decoded_input?: FunctionVariable[];
  output: string;
  decoded_output: PurpleDecodedOutput[] | null;
  network_id: string;
  calls: TentacledCall[] | null;
  refund_gas?: number;
}

interface TentacledCall {
  hash: string;
  contract_name: string;
  function_name: string;
  function_pc: number;
  function_op: string;
  function_file_index: number;
  function_code_start: number;
  function_line_number: number;
  function_code_length: number;
  function_states: PurpleFunctionState[];
  caller_pc: number;
  caller_op: string;
  caller_file_index: number;
  caller_line_number: number;
  caller_code_start: number;
  caller_code_length: number;
  call_type: string;
  from: string;
  from_balance: null;
  to: string;
  to_balance: null;
  value: null;
  caller: Caller;
  block_timestamp: Date;
  gas: number;
  gas_used: number;
  input: string;
  decoded_input: FunctionVariableElement[];
  output: string;
  decoded_output: FunctionVariable[];
  network_id: string;
  calls: null;
}

interface FunctionVariableElement {
  soltype: SoltypeElement;
  value: string;
}

interface FunctionVariable {
  soltype: SoltypeElement;
  value: PurpleValue | string;
}

interface PurpleValue {
  ballot: string;
  basedOn: string;
  configured: string;
  currency: string;
  cycleLimit: string;
  discountRate: string;
  duration: string;
  fee: string;
  id: string;
  metadata: string;
  number: string;
  projectId: string;
  start: string;
  tapped: string;
  target: string;
  weight: string;
}

interface PurpleFunctionState {
  soltype: SoltypeElement;
  value: Record<string, string>;
}

interface PurpleDecodedOutput {
  soltype: SoltypeElement;
  value: boolean | PurpleValue | string;
}

interface FluffyFunctionState {
  soltype: PurpleSoltype;
  value: Record<string, string>;
}

interface PurpleSoltype {
  name: string;
  type: SoltypeType;
  storage_location: StorageLocation;
  components: null;
  offset: number;
  index: string;
  indexed: boolean;
}

interface Input {
  soltype: SoltypeElement | null;
  value: boolean | string;
}

interface CallTraceFunctionState {
  soltype: PurpleSoltype;
  value: Record<string, string>;
}

export interface Log {
  name: string | null;
  anonymous: boolean;
  inputs: Input[];
  raw: LogRaw;
}

interface LogRaw {
  address: string;
  topics: string[];
  data: string;
}

export interface StateDiff {
  soltype: SoltypeElement | null;
  original: string | Record<string, string>;
  dirty: string | Record<string, string>;
  raw: RawElement[];
}

interface RawElement {
  address: string;
  key: string;
  original: string;
  dirty: string;
}

/**
 * Structured simulation report types
 */
export interface SimulationCheck {
  title: string;
  status: "passed" | "warning" | "failed";
  details?: string;
  infoItems?: Array<{
    label: string;
    value: string;
    isCode?: boolean;
    isLink?: boolean;
    href?: string;
  }>;
}

export interface SimulationStateChange {
  contract: string;
  contractAddress?: string;
  key: string;
  oldValue: string;
  newValue: string;
  isRawSlot?: boolean;
}

export interface SimulationEvent {
  name: string;
  contract: string;
  contractAddress?: string;
  params: Array<{
    name: string;
    value: string;
    type: string;
  }>;
}

export interface SimulationCalldata {
  decoded: string;
  raw: string;
  links?: Array<{
    text: string;
    address: string;
    href: string;
  }>;
}

export interface StructuredSimulationReport {
  title: string;
  proposalText: string;
  status: "success" | "warning" | "error";
  summary: string;
  checks: SimulationCheck[];
  stateChanges: SimulationStateChange[];
  events: SimulationEvent[];
  calldata?: SimulationCalldata;
  metadata: {
    blockNumber: string;
    timestamp: string;
    proposalId: string;
    proposer: string;
  };
  simulation: TenderlySimulation;
}

export interface FrontendData {
  proposalData: {
    id: string;
    targets: `0x${string}`[];
    values: bigint[] | string[];
    signatures: string[];
    calldatas: `0x${string}`[];
    description: string;
  };
  report: {
    status: "success" | "warning" | "error";
    summary: string;
    markdownReport: string;
    structuredReport?: StructuredSimulationReport;
  };
}
