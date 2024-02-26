import { type TenantContracts, type TenantNamespace } from "./types";
import {
  AlligatorOPV5__factory,
  OptimismGovernor__factory,
  OptimismToken__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";
import provider from "@/app/lib/provider";

export default class Tenant {
  private static instance: Tenant;
  private _isProd: boolean;
  private _namespace: TenantNamespace;

  private constructor() {
    this._isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
    this._namespace = (process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME as TenantNamespace) || "optimism";
  }

  public static getInstance(): Tenant {
    if (!Tenant.instance) {
      Tenant.instance = new Tenant();
    }
    return Tenant.instance;
  }

  get namespace(): TenantNamespace {
    return this._namespace;
  }

  get isProd(): boolean {
    return this._isProd;
  }

  public contracts(): TenantContracts {

    switch (this._namespace) {

      case "optimism":
        return opContracts;

      default:
        throw new Error(`Can't find contracts for namespace: ${this._namespace}`);
    }
  }
}

// TODO: Move this into contracts
const isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";

const opContracts: TenantContracts = {
  governor: {
    contract: OptimismGovernor__factory.connect(
      isProd
        ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
        : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
      provider,
    ),
    address: isProd
      ? "0xcDF27F107725988f2261Ce2256bDfCdE8B382B10"
      : "0x6E17cdef2F7c1598AD9DfA9A8acCF84B1303f43f",
    chainId: 10,
    abi: OptimismGovernor__factory.abi,
    v6UpgradeBlock:
      process.env.NEXT_PUBLIC_AGORA_ENV === "prod" ? 114995000 : 114615036,
  },

  proposalTypesConfigurator: {
    contract: OptimismGovernor__factory.connect(
      isProd
        ? "0x67ecA7B65Baf0342CE7fBf0AA15921524414C09f"
        : "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
      provider,
    ),
    address: process.env.NEXT_PUBLIC_AGORA_ENV === "prod"
      ? "0x67ecA7B65Baf0342CE7fBf0AA15921524414C09f"
      : "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
    chainId: 10,
    abi: ProposalTypesConfigurator__factory.abi,
  },

  token: {
    contract: OptimismToken__factory.connect(
      "0x4200000000000000000000000000000000000042",
      provider,
    ),
    address: "0x4200000000000000000000000000000000000042",
    chainId: 10,
    abi: OptimismToken__factory.abi,
  },

  alligator: {
    contract: AlligatorOPV5__factory.connect(
      isProd
        ? "0x7f08F3095530B67CdF8466B7a923607944136Df0"
        : "0xfD6be5F4253Aa9fBB46B2BFacf9aa6F89822f4a6",

      provider,
    ),
    address:
      isProd
        ? "0x7f08F3095530B67CdF8466B7a923607944136Df0"
        : "0xfD6be5F4253Aa9fBB46B2BFacf9aa6F89822f4a6",
    chainId: 10,
    abi: AlligatorOPV5__factory.abi,
  },
};