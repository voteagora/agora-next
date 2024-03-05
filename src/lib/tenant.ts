import { type TenantNamespace, type TenantToken } from "./types";
import { DaoSlug } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenantTokenFactory";
import {
  TenantContractDefinition,
  TenantContractType,
} from "@/lib/tenantContractDefinition";
import TenantContractFactory from "@/lib/tenantContractFactory";
import { BaseContract } from "ethers";

export default class Tenant {
  private static instance: Tenant;

  private readonly _isProd: boolean;
  private readonly _namespace: TenantNamespace;
  private readonly _slug: string;
  private readonly _token: TenantToken;
  private readonly _contracts: TenantContractDefinition<BaseContract>[];

  private constructor() {
    const {
      NEXT_PUBLIC_AGORA_INSTANCE_NAME,
      NEXT_PUBLIC_AGORA_ENV,
      NEXT_PUBLIC_AGORA_INSTANCE_TOKEN,
    } = process.env;

    this._namespace =
      (NEXT_PUBLIC_AGORA_INSTANCE_NAME as TenantNamespace) || "optimism";
    this._isProd = NEXT_PUBLIC_AGORA_ENV === "prod";
    this._slug = NEXT_PUBLIC_AGORA_INSTANCE_TOKEN || "OP";
    this._token = TenantTokenFactory.create(this._namespace);
    this._contracts = TenantContractFactory.create(
      this._namespace,
      this._isProd
    );
  }

  public get namespace(): TenantNamespace {
    return this._namespace;
  }

  public get isProd(): boolean {
    return this._isProd;
  }

  public get slug(): DaoSlug {
    return this._slug as DaoSlug;
  }

  public get token(): TenantToken {
    return this._token;
  }

  public contractDefinition(
    type: TenantContractType
  ): TenantContractDefinition<BaseContract> {
    const contract = this._contracts.find((def) => def.type === type);
    if (!contract) {
      throw new Error(`Contract of type ${type} not found`);
    }
    return contract;
  }

  public static getInstance(): Tenant {
    if (!Tenant.instance) {
      Tenant.instance = new Tenant();
    }
    return Tenant.instance;
  }
}
