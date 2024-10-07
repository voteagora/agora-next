import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { BaseContract, AddressLike } from "ethers";
import { PartialDelegationStruct } from "@/lib/contracts/generated/AgoraToken";

export interface ITokenContract extends BaseContract {
  allowance: TypedContractMethod<
    [owner: AddressLike, spender: AddressLike],
    [bigint],
    "view"
  >;
  balanceOf: TypedContractMethod<[account: AddressLike], [bigint], "view">;
  totalSupply: TypedContractMethod<[], [bigint], "view">;
  decimals: TypedContractMethod<[], [bigint], "view">;
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

  "delegate((address,uint96)[])"?: TypedContractMethod<
    [_partialDelegations: PartialDelegationStruct[]],
    [void],
    "nonpayable"
  >;
}
