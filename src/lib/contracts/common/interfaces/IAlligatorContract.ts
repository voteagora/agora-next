import type { TypedContractMethod } from "@/lib/contracts/generated/common";
import type { BaseContract, AddressLike } from "ethers";

export interface IAlligatorContract extends BaseContract {
  proxyAddress: TypedContractMethod<
    [proxyOwner: AddressLike],
    [string],
    "view"
  >;
}
