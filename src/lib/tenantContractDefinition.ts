import { Address } from "viem";

type TenantContractParams<ContractType> = {
  abi: any;
  chainId: number;
  contract: ContractType;
  address: Address;
  v6UpgradeBlock?: number;
};

export class TenantContractDefinition<ContractType> {
  public abi: any;
  public chainId: number;
  public contract: ContractType;
  private _address: Address;
  public v6UpgradeBlock?: number;

  constructor({
    abi,
    chainId,
    contract,
    address,
    v6UpgradeBlock,
  }: TenantContractParams<ContractType>) {
    this.abi = abi;
    this.chainId = chainId;
    this.contract = contract;
    this._address = address;
    this.v6UpgradeBlock = v6UpgradeBlock;
  }

  get address(): string {
    return this._address.toLowerCase();
  }
}
