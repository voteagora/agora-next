import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { AddressLike, BaseContract, BigNumberish } from "ethers";

export interface IGovernorContract extends BaseContract {
  // Uniswap
  quorumVotes: TypedContractMethod<[], [bigint], "view">;

  // OPTIMISM _-------

  quorum?: TypedContractMethod<[proposalId: BigNumberish], [bigint], "view">;

  manager?: TypedContractMethod<[], [string], "view">;

  votingDelay?: TypedContractMethod<[], [bigint], "view">;

  votingPeriod?: TypedContractMethod<[], [bigint], "view">;

  weightCast?: TypedContractMethod<
    [proposalId: BigNumberish, account: AddressLike],
    [bigint],
    "view"
  >;
}
