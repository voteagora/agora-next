import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { BaseContract, AddressLike } from "ethers";

export interface ITokenContract extends BaseContract {
  allowance: TypedContractMethod<
    [owner: AddressLike, spender: AddressLike],
    [bigint],
    "view"
  >;
  balanceOf: TypedContractMethod<[account: AddressLike], [bigint], "view">;
  totalSupply: TypedContractMethod<[], [bigint], "view">;
  delegate: TypedContractMethod<[delegatee: AddressLike], [void], "nonpayable">;
}
