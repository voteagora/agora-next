interface TenantEnv {
  NEXT_PUBLIC_AGORA_INSTANCE_NAME: string;
}

export interface Tenant {
  name: string;
  env: TenantEnv;
}

export interface Config {
  tenants: Tenant[];
}
