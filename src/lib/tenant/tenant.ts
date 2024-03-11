import {
  type TenantContracts,
  type TenantNamespace,
  type TenantToken,
} from "../types";
import { DaoSlug } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import TenantContractFactory from "@/lib/tenant/tenantContractFactory";
import TenantSlugFactory from "@/lib/tenant/tenantSlugFactory";
import { TENANT_NAMESPACES } from "@/lib/constants";
import TenantUIFactory from "@/lib/tenant/tenantUIFactory";

export default class Tenant {
  private static instance: Tenant;

  private readonly _contracts: TenantContracts;
  private readonly _isProd: boolean;
  private readonly _namespace: TenantNamespace;
  private readonly _slug: string;
  private readonly _token: TenantToken;
  private readonly _ui: any;

  private constructor() {
    const { NEXT_PUBLIC_AGORA_INSTANCE_NAME, NEXT_PUBLIC_AGORA_ENV } =
      process.env;

    // TODO: Remove default case
    this._namespace =
      (NEXT_PUBLIC_AGORA_INSTANCE_NAME as TenantNamespace) ||
      TENANT_NAMESPACES.OPTIMISM;
    this._isProd = NEXT_PUBLIC_AGORA_ENV === "prod";

    this._contracts = TenantContractFactory.create(
      this._namespace,
      this._isProd
    );
    this._slug = TenantSlugFactory.create(this._namespace);
    this._token = TenantTokenFactory.create(this._namespace);
    this._ui = TenantUIFactory.create(this._namespace);
  }

  public get contracts(): TenantContracts {
    return this._contracts;
  }

  public get isProd(): boolean {
    return this._isProd;
  }

  public get namespace(): TenantNamespace {
    return this._namespace;
  }

  public get slug(): DaoSlug {
    return this._slug as DaoSlug;
  }

  public get token(): TenantToken {
    return this._token;
  }

  public get ui(): any {
    return this._ui;
  }

  public static getInstance(): Tenant {
    if (!Tenant.instance) {
      Tenant.instance = new Tenant();
    }
    return Tenant.instance;
  }
}
