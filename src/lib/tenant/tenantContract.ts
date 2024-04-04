import { Address } from "viem";
import { ChainConstants } from "viem/types/chain";

type TenantContractParams<ContractType> = {
  abi: any;
  chain: ChainConstants;
  contract: ContractType;
  address: Address;
  v6UpgradeBlock?: number;
  optionBudgetChangeDate?: Date;
};

export class TenantContract<ContractType> {
  public abi: any;
  public chain: ChainConstants;
  public contract: ContractType;
  private _address: Address;
  public v6UpgradeBlock?: number;
  public optionBudgetChangeDate?: Date;

  constructor({
    abi,
    chain,
    contract,
    address,
    v6UpgradeBlock,
    optionBudgetChangeDate,
  }: TenantContractParams<ContractType>) {
    this.abi = abi;
    this.chain = chain;
    this.contract = contract;
    this._address = address;
    this.v6UpgradeBlock = v6UpgradeBlock;
    this.optionBudgetChangeDate = optionBudgetChangeDate;
  }

  get address(): string {
    return this._address.toLowerCase();
  }
}
