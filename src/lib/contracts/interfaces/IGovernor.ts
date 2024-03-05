import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { AddressLike, BaseContract, BigNumberish } from "ethers";

export interface IGovernor extends BaseContract {
  quorum: TypedContractMethod<[proposalId: BigNumberish], [bigint], "view">;

  weightCast: TypedContractMethod<
    [proposalId: BigNumberish, account: AddressLike],
    [bigint],
    "view"
  >;
}
