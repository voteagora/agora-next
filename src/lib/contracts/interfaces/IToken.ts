import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { BaseContract, AddressLike } from "ethers";

export interface IToken extends BaseContract {
  balanceOf: TypedContractMethod<[account: AddressLike], [bigint], "view">;
}
