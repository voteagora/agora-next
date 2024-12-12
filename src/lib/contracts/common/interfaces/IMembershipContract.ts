import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { BaseContract, AddressLike } from "ethers";

export interface IMembershipContract extends BaseContract {
  balanceOf: TypedContractMethod<[account: AddressLike], [bigint], "view">;
  delegate?: TypedContractMethod<
    [delegatee: AddressLike],
    [void],
    "nonpayable"
  >;

  // Agora governor methods
  "delegate(address)"?: TypedContractMethod<
    [delegatee: AddressLike],
    [void],
    "nonpayable"
  >;

  getPastTotalSupply: TypedContractMethod<
    [blockNumber: number],
    [bigint],
    "view"
  >;

  nonces?: TypedContractMethod<[owner: AddressLike], [bigint], "view">;
}
