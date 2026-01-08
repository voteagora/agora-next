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
import { isMainContractDeployment } from "@/lib/envConfig";

export const BRAND_NAME_MAPPINGS: Record<string, string> = {
  ens: "ENS",
  etherfi: "EtherFi",
  pguild: "Protocol Guild",
  boost: "Boost",
  demo: "Canopy",
};

export default class Tenant {
  private static instance: Tenant;

  private readonly _contracts: TenantContracts;
  private readonly _isMain: boolean;
  private readonly _namespace: TenantNamespace;
  private readonly _slug: DaoSlug;
  private readonly _token: TenantToken;
  private readonly _ui: TenantUI;
  private readonly _brandName: string;

  private constructor() {
    this._namespace = process.env
      .NEXT_PUBLIC_AGORA_INSTANCE_NAME as TenantNamespace;
    this._isMain = isMainContractDeployment();
    this._contracts = TenantContractFactory.create(
      this._namespace,
      this._isMain,
      process.env.NEXT_PUBLIC_ALCHEMY_ID as string
    );
    this._slug = TenantSlugFactory.create(this._namespace);
    this._token = TenantTokenFactory.create(this._namespace);
    this._ui = TenantUIFactory.create(this._namespace);
    this._brandName = this.deriveBrandName(this._namespace);
  }

  public get contracts(): TenantContracts {
    return this._contracts;
  }

  public get isMain(): boolean {
    return this._isMain;
  }

  /**
   * @deprecated Use isMain instead
   */
  public get isProd(): boolean {
    return this._isMain;
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

  public get brandName(): string {
    return this._brandName;
  }

  public static current(): Tenant {
    if (!Tenant.instance) {
      Tenant.instance = new Tenant();
    }
    return Tenant.instance;
  }

  private deriveBrandName(namespace: TenantNamespace): string {
    if (namespace.toLowerCase() in BRAND_NAME_MAPPINGS) {
      return BRAND_NAME_MAPPINGS[namespace.toLowerCase()];
    }
    return namespace.charAt(0).toUpperCase() + namespace.slice(1).toLowerCase();
  }
}
