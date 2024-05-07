/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "./common";

export declare namespace IProposalTypesConfigurator {
  export type ProposalTypeStruct = {
    quorum: BigNumberish;
    approvalThreshold: BigNumberish;
    name: string;
  };

  export type ProposalTypeStructOutput = [
    quorum: bigint,
    approvalThreshold: bigint,
    name: string
  ] & { quorum: bigint; approvalThreshold: bigint; name: string };
}

export interface ProposalTypesConfiguratorInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "PERCENT_DIVISOR"
      | "governor"
      | "proposalTypes"
      | "setProposalType"
  ): FunctionFragment;

  getEvent(nameOrSignatureOrTopic: "ProposalTypeSet"): EventFragment;

  encodeFunctionData(
    functionFragment: "PERCENT_DIVISOR",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "governor", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "proposalTypes",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setProposalType",
    values: [BigNumberish, BigNumberish, BigNumberish, string]
  ): string;

  decodeFunctionResult(
    functionFragment: "PERCENT_DIVISOR",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "governor", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "proposalTypes",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setProposalType",
    data: BytesLike
  ): Result;
}

export namespace ProposalTypeSetEvent {
  export type InputTuple = [
    proposalTypeId: BigNumberish,
    quorum: BigNumberish,
    approvalThreshold: BigNumberish,
    name: string
  ];
  export type OutputTuple = [
    proposalTypeId: bigint,
    quorum: bigint,
    approvalThreshold: bigint,
    name: string
  ];
  export interface OutputObject {
    proposalTypeId: bigint;
    quorum: bigint;
    approvalThreshold: bigint;
    name: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ProposalTypesConfigurator extends BaseContract {
  connect(runner?: ContractRunner | null): ProposalTypesConfigurator;
  waitForDeployment(): Promise<this>;

  interface: ProposalTypesConfiguratorInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  PERCENT_DIVISOR: TypedContractMethod<[], [bigint], "view">;

  governor: TypedContractMethod<[], [string], "view">;

  proposalTypes: TypedContractMethod<
    [proposalTypeId: BigNumberish],
    [IProposalTypesConfigurator.ProposalTypeStructOutput],
    "view"
  >;

  setProposalType: TypedContractMethod<
    [
      proposalTypeId: BigNumberish,
      quorum: BigNumberish,
      approvalThreshold: BigNumberish,
      name: string
    ],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "PERCENT_DIVISOR"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "governor"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "proposalTypes"
  ): TypedContractMethod<
    [proposalTypeId: BigNumberish],
    [IProposalTypesConfigurator.ProposalTypeStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "setProposalType"
  ): TypedContractMethod<
    [
      proposalTypeId: BigNumberish,
      quorum: BigNumberish,
      approvalThreshold: BigNumberish,
      name: string
    ],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "ProposalTypeSet"
  ): TypedContractEvent<
    ProposalTypeSetEvent.InputTuple,
    ProposalTypeSetEvent.OutputTuple,
    ProposalTypeSetEvent.OutputObject
  >;

  filters: {
    "ProposalTypeSet(uint256,uint16,uint16,string)": TypedContractEvent<
      ProposalTypeSetEvent.InputTuple,
      ProposalTypeSetEvent.OutputTuple,
      ProposalTypeSetEvent.OutputObject
    >;
    ProposalTypeSet: TypedContractEvent<
      ProposalTypeSetEvent.InputTuple,
      ProposalTypeSetEvent.OutputTuple,
      ProposalTypeSetEvent.OutputObject
    >;
  };
}
