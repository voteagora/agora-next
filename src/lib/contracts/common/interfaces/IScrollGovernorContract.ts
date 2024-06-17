import type { TypedContractMethod } from "../../generated/common";
import type { BaseContract, BigNumberish } from "ethers";

export interface IScrollGovernorContract extends BaseContract {
  quorum: TypedContractMethod<[proposalId: BigNumberish], [bigint], "view">;

  manager: TypedContractMethod<[], [string], "view">;

  votingDelay: TypedContractMethod<[], [bigint], "view">;

  votingPeriod: TypedContractMethod<[], [bigint], "view">;
}
