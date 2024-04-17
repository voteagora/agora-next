import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { AddressLike, BaseContract, BigNumberish } from "ethers";

export interface IStaker extends BaseContract {
  depositorTotalStaked: TypedContractMethod<
    [depositor: AddressLike],
    [bigint],
    "view"
  >;

  deposits: TypedContractMethod<
    [depositId: BigNumberish],
    [
      [bigint, string, string, string] & {
        balance: bigint;
        owner: string;
        delegatee: string;
        beneficiary: string;
      }
    ],
    "view"
  >;

  totalStaked: TypedContractMethod<[], [bigint], "view">;

  rewardPerTokenAccumulated: TypedContractMethod<[], [bigint], "view">;

  rewardEndTime: TypedContractMethod<[], [bigint], "view">;
}
