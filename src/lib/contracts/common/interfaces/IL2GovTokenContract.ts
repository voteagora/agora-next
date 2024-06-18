import type { TypedContractMethod } from "../../generated/common";
import type { BaseContract, AddressLike } from "ethers";

export interface IL2GovTokenContract extends BaseContract {
  balanceOf: TypedContractMethod<[account: AddressLike], [bigint], "view">;
  totalSupply: TypedContractMethod<[], [bigint], "view">;
  "delegate(address)": TypedContractMethod<
    [delegatee: AddressLike],
    [void],
    "nonpayable"
  >;
}
