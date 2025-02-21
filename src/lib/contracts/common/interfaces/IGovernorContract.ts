import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { AddressLike, BaseContract, BigNumberish } from "ethers";

export interface IGovernorContract extends BaseContract {
  // BRAVO
  quorumVotes?: TypedContractMethod<[], [bigint], "view">;

  // -------
  // AGORA, BRAVO

  name: TypedContractMethod<[], [string], "view">;

  admin?: TypedContractMethod<[], [string], "view">;

  quorum?: TypedContractMethod<[proposalId: BigNumberish], [bigint], "view">;

  manager?: TypedContractMethod<[], [string], "view">;

  proposalThreshold?: TypedContractMethod<[], [bigint], "view">;

  votingDelay?: TypedContractMethod<[], [bigint], "view">;

  votingPeriod?: TypedContractMethod<[], [bigint], "view">;

  weightCast?: TypedContractMethod<
    [proposalId: BigNumberish, account: AddressLike],
    [bigint],
    "view"
  >;
}
