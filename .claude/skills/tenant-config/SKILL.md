---
name: tenant-config
description: Scaffold or audit a tenant UI config in src/lib/tenant/configs/ui/. Accepts a tenant name and action (create|audit|diff).
disable-model-invocation: true
---

# Tenant Config Skill

## Usage

```
/tenant-config <name> [create|audit|diff]
```

- **create** — Scaffold a new `src/lib/tenant/configs/ui/<name>.ts` from the canonical structure below
- **audit** — Check an existing config for missing required keys vs the peer set
- **diff** — Compare a tenant's config against optimism.ts (the reference config)

## Required keys checklist (all tenants must have these)

```
TenantUI({
  title              ✓ string
  logo               ✓ SVG import
  tokens             ✓ [TenantTokenFactory.create(TENANT_NAMESPACES.<NAME>)]
  assets             ✓ { success, pending, delegate }
  customization      ✓ { primary, secondary, tertiary, neutral, wash, line,
                         positive, negative, brandPrimary, brandSecondary }
  delegates          ✓ { allowed[], advanced[], retired[] }
  governanceIssues   ✓ [{ icon, title, key }]
  organization       ✓ { title }
  links              ✓ [{ name, title, url }]
  pages              ✓ { info, delegates, proposals, ... }
  navigation         ✓ { links[], name }
})
```

## Scaffold template

```typescript
import { TenantUI } from "@/lib/tenant/tenantUI";
import { TENANT_NAMESPACES } from "@/lib/constants";
import TenantTokenFactory from "@/lib/tenant/tenantTokenFactory";
// TODO: import logo and asset SVGs from @/assets/tenant/<name>_*.svg

export const <name>TenantUIConfig = new TenantUI({
  title: "<Name> Agora",
  logo: logo, // TODO
  tokens: [TenantTokenFactory.create(TENANT_NAMESPACES.<NAME>)],

  assets: {
    success: successImage, // TODO
    pending: pendingImage, // TODO
    delegate: delegateImage, // TODO
  },

  customization: {
    primary: "0 0 0",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "255 255 255",
    wash: "255 255 255",
    line: "229 229 229",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "0 0 0",
    brandSecondary: "255 255 255",
  },

  delegates: {
    allowed: [],
    advanced: [],
    retired: [],
  },

  governanceIssues: [],

  organization: {
    title: "<Name> Foundation",
  },

  links: [],

  pages: {
    // TODO: configure per-tenant pages
  },

  navigation: {
    links: [],
    name: "<name>",
  },
});
```

## Audit steps (run these when auditing)

1. Read `src/lib/tenant/configs/ui/<name>.ts`
2. Read `src/lib/tenant/configs/ui/optimism.ts` as the reference
3. Diff top-level keys — flag any missing from the checklist above
4. Check `TENANT_NAMESPACES.<NAME>` exists in `src/lib/constants.ts`
5. Verify all image imports resolve to existing files in `src/assets/tenant/`
6. Check the tenant is registered in `src/lib/tenant/tenantList.ts` (or equivalent)
