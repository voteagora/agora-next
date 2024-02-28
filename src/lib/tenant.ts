import { type TenantNamespace, type TenantToken } from "./types";
import { DaoSlug } from "@prisma/client";
import TenantTokenFactory from "@/lib/tenantTokenFactory";

interface ITenant {
  isProd: boolean;
  namespace: TenantNamespace;
  slug: DaoSlug;
  token: TenantToken;
}

export default class Tenant implements ITenant {
  private static instance: Tenant;

  private readonly _isProd: boolean;
  private readonly _namespace: TenantNamespace;
  private readonly _slug: string;
  private readonly _token: TenantToken;

  private constructor() {
    this._namespace =
      (process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME as TenantNamespace) ||
      "optimism";
    this._isProd = process.env.NEXT_PUBLIC_AGORA_ENV === "prod";
    this._slug = process.env.NEXT_PUBLIC_AGORA_INSTANCE_TOKEN || "OP";
    this._token = TenantTokenFactory.create(this._namespace);
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

  public static getInstance(): Tenant {
    if (!Tenant.instance) {
      Tenant.instance = new Tenant();
    }
    return Tenant.instance;
  }
}
