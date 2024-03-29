import { Address } from "viem";

type TenantContractParams<ContractType> = {
  abi: any;
  chainId: number;
  chainName: string;
  contract: ContractType;
  address: Address;
  v6UpgradeBlock?: number;
  optionBudgetChangeDate?: Date;
};

export class TenantContract<ContractType> {
  public abi: any;
  public chainId: number;
  public chainName: string;
  public contract: ContractType;
  private _address: Address;
  public v6UpgradeBlock?: number;
  public optionBudgetChangeDate?: Date;

  constructor({
    abi,
    chainId,
    chainName,
    contract,
    address,
    v6UpgradeBlock,
    optionBudgetChangeDate,
  }: TenantContractParams<ContractType>) {
    this.abi = abi;
    this.chainId = chainId;
    this.chainName = chainName;
    this.contract = contract;
    this._address = address;
    this.v6UpgradeBlock = v6UpgradeBlock;
    this.optionBudgetChangeDate = optionBudgetChangeDate;
  }

  get address(): string {
    return this._address.toLowerCase();
  }
}
