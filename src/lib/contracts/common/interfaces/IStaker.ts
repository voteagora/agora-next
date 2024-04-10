import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { AddressLike, BaseContract, BigNumberish } from "ethers";

export interface IStaker extends BaseContract {

  depositorTotalStaked: TypedContractMethod<
    [depositor: AddressLike],
    [bigint],
    "view"
  >;
}
