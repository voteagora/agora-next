import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { BaseContract, AddressLike } from "ethers";

export interface ITokenContract extends BaseContract {
  balanceOf: TypedContractMethod<[account: AddressLike], [bigint], "view">;
}
