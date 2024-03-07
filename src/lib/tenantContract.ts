import { BaseContract } from "ethers";
import { Address } from "viem";

interface ITenantContract {
  abi: any;
  chainId: number;
  contract: BaseContract;
  mainnetAddress: Address;
  testnetAddress?: Address;
  v6UpgradeBlock?: number;
}

export class TenantContract {
  private _isProd: boolean;
  readonly abi: any;
  readonly chainId: number;
  readonly contract: BaseContract;
  readonly mainnetAddress: Address;
  readonly testnetAddress?: Address;
  readonly v6UpgradeBlock?: number;

  constructor(props: ITenantContract) {
    this.abi = props.abi;
    this.chainId = props.chainId;
    this.contract = props.contract;
    this.mainnetAddress = props.mainnetAddress;
    this.testnetAddress = props.testnetAddress;
    this.v6UpgradeBlock = props.v6UpgradeBlock;

    this._isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
  }

  /**
   * Returns a contract based on the current environment and applies the
   * lover case transformation.
   */
  get address(): string {
    return (
      this._isProd || !this.testnetAddress
        ? this.mainnetAddress
        : this.testnetAddress
    ).toLowerCase();
  }
}
