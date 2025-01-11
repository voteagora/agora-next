import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { BaseContract } from "ethers";

export interface IVotableSupplyContract extends BaseContract {
  votableSupply?: TypedContractMethod<[], [bigint], "view">;

  "_updateVotableSupply(uint256)"?: TypedContractMethod<
    [newVotableSupply: bigint],
    [void],
    "nonpayable"
  >;
}
