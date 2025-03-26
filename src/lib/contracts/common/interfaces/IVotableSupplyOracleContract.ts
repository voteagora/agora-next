import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { BaseContract, AddressLike } from "ethers";

export interface IVotableSupplyOracleContract extends BaseContract {
  // Function to update the votable supply
  _updateVotableSupply: TypedContractMethod<
    [newVotableSupply: bigint],
    [void],
    "nonpayable"
  >;

  // Function to update the votable supply at a specific index
  _updateVotableSupplyAt: TypedContractMethod<
    [index: bigint, newVotableSupply: bigint],
    [void],
    "nonpayable"
  >;

  "votableSupply()": TypedContractMethod<[], [bigint], "view">;

  // Current owner of the contract
  owner: TypedContractMethod<[], [string], "view">;
}
