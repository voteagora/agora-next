import { BaseContract } from "ethers";
import { Address } from "viem";

export enum TenantContractType {"GOVERNOR", "TOKEN", "ALLIGATOR", "TYPES_CONFIGURATOR" }

type TenantContractParams = {
  abi: any;
  chainId: number;
  contract: BaseContract;
  address: Address;
  type: TenantContractType;
  v6UpgradeBlock?: number;
};

export class TenantContract {
  public abi: any;
  public chainId: number;
  public contract: BaseContract;
  private _address: Address;
  public type: TenantContractType;
  public v6UpgradeBlock?: number;

  constructor({
                abi,
                chainId,
                contract,
                address,
                type,
                v6UpgradeBlock,
              }: TenantContractParams,
  ) {
    this.abi = abi;
    this.chainId = chainId;
    this.contract = contract;
    this._address = address;
    this.type = type;
    this.v6UpgradeBlock = v6UpgradeBlock;
  }


  get address(): string {
    return this._address.toLowerCase();
  }
}