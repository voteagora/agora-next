import {
  type TenantContracts,
  type TenantNamespace,
  type TenantToken,
} from "../types";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
import TenantContractFactory from "@/lib/tenant/tenantContractFactory";
import TenantSlugFactory from "@/lib/tenant/tenantSlugFactory";
import TenantUIFactory from "@/lib/tenant/tenantUIFactory";
import { TenantUI } from "@/lib/tenant/tenantUI";
import { type DaoSlug } from "@prisma/client";

export default class Tenant {
  private static instance: Tenant;

  private readonly _contracts: TenantContracts;
  private readonly _isProd: boolean;
  private readonly _namespace: TenantNamespace;
  private readonly _slug: DaoSlug;
  private readonly _token: TenantToken;
  private readonly _ui: TenantUI;

  private constructor() {
    this._namespace = process.env
      .NEXT_PUBLIC_AGORA_INSTANCE_NAME as TenantNamespace;
    this._isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
    this._contracts = TenantContractFactory.create(
      this._namespace,
      this._isProd,
      process.env.NEXT_PUBLIC_ALCHEMY_ID as string
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
    return this._slug;
  }

  public get token(): TenantToken {
    return this._token;
  }

  public get ui(): TenantUI {
    return this._ui;
  }

  public static current(): Tenant {
    if (!Tenant.instance) {
      Tenant.instance = new Tenant();
    }
    return Tenant.instance;
  }
}
