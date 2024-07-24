import { Address } from "viem";
import { ChainConstants } from "viem/types/chain";
import { Provider } from "ethers";

type TenantContractParams<ContractType> = {
  abi: any;
  address: Address;
  chain: ChainConstants;
  contract: ContractType;
  optionBudgetChangeDate?: Date;
  provider: Provider;
  v6UpgradeBlock?: number;
};

export class TenantContract<ContractType> {
  private _address: Address;
  public abi: any;
  public chain: ChainConstants;
  public contract: ContractType;
  public optionBudgetChangeDate?: Date;
  public provider: Provider;
  public v6UpgradeBlock?: number;

  constructor({
    abi,
    address,
    chain,
    contract,
    optionBudgetChangeDate,
    provider,
    v6UpgradeBlock,
  }: TenantContractParams<ContractType>) {
    this._address = address;
    this.abi = abi;
    this.chain = chain;
    this.contract = contract;
    this.optionBudgetChangeDate = optionBudgetChangeDate;
    this.provider = provider;
    this.v6UpgradeBlock = v6UpgradeBlock;
  }

  get address(): string {
    return this._address.toLowerCase();
  }
}
