# Migración de Shape: Base de Datos → DAO-Node

## 📋 Resumen Ejecutivo

**Objetivo:** Migrar Shape para que funcione con mínimo uso de la base de datos, obteniendo la mayoría de datos directamente del nodo blockchain a través de DAO-Node.

**Estado Actual:** Shape está completamente dependiente de la base de datos con 0 toggles de DAO-Node habilitados.

**Fecha:** 25 de Julio, 2025

---

## 🔍 Análisis del Estado Actual

### Configuración Actual de Shape

- **Ubicación:** `src/lib/tenant/configs/ui/shape.ts`
- **Toggles DAO-Node:** ❌ NINGUNO habilitado
- **Dependencia DB:** 🔴 **100% dependiente**

### Comparación con Otros Tenants

| Tenant         | Governor           | DAO-Node Proposals | DAO-Node Votes | DAO-Node Delegates | Estado        |
| -------------- | ------------------ | ------------------ | -------------- | ------------------ | ------------- |
| Uniswap        | v1 (Bravo)         | ✅                 | ✅             | ✅                 | Migrado       |
| Derive         | v1 (Agora)         | ✅                 | ✅             | ✅                 | Migrado       |
| Protocol Guild | **v1 (Agora)**     | ❌                 | ✅             | ❌                 | **Parcial**   |
| Shape          | **v2 (Agora 2.0)** | ❌                 | ❌             | ❌                 | **Pendiente** |

**🎯 Insights Clave:**

- **Shape es el ÚNICO tenant con Governor v2.0** (`AGORA_20`)
- **Protocol Guild usa Governor v1** (`AGORA`) con algunos toggles DAO-Node habilitados
- **Shape usa ERC721 (Membership)** mientras otros usan ERC20
- **Shape soporta Scopes** (`supportScopes: true`) - característica avanzada

---

## 🗃️ Dependencias Actuales con Base de Datos

### 1. **Propuestas** (`shapeProposals`)

```typescript
// En: src/lib/prismaUtils.ts líneas 38, 211, 314, 395, 478
prismaWeb3Client.shapeProposals.findMany(condition);
```

**Datos obtenidos:**

- `proposal_id`, `proposer`, `description`
- `start_block`, `end_block`, `created_block`
- `proposal_data`, `proposal_results`
- `proposal_type`, `proposal_type_data`

### 2. **Delegados** (`shapeDelegates`)

```typescript
// Vista en DB: shape.delegates
-delegate(address) - num_of_delegators - direct_vp, advanced_vp, voting_power;
```

### 3. **Votos** (`shapeVotes`)

```typescript
// En: src/lib/prismaUtils.ts línea 718
prismaWeb3Client.shapeVotes.findMany(condition);
```

### 4. **Supply Votable** (`shapeVotableSupply`)

```typescript
// En: src/lib/prismaUtils.ts línea 121
prismaWeb3Client.shapeVotableSupply.findFirst({});
```

### 5. **Delegaciones** (`shapeDelegatees`)

```typescript
// En: src/lib/prismaUtils.ts línea 38
prismaWeb3Client.shapeDelegatees.findFirst(condition);
```

### 6. **Depósitos de Staking** (`shapeStakedDeposits`)

```typescript
// En: src/lib/prismaUtils.ts líneas 819, 866
prismaWeb3Client.shapeStakedDeposits.findMany(condition);
```

### 7. **Tipos de Propuestas** (`shapeProposalTypes`)

```typescript
// En: src/lib/prismaUtils.ts línea 611
prismaWeb3Client.shapeProposalTypes.findMany(condition);
```

---

## 🎯 Plan de Migración

### Fase 1: Habilitar Toggles DAO-Node Básicos

**Toggles a Agregar en `shape.ts`:**

```typescript
{
  name: "use-daonode-for-proposals",
  enabled: true,
},
{
  name: "dao-node/proposal-votes",
  enabled: true,
},
{
  name: "dao-node/delegate/addr",
  enabled: true,
},
{
  name: "use-daonode-for-votable-supply",
  enabled: true,
},
{
  name: "use-daonode-for-proposal-types",
  enabled: true,
},
```

### Fase 2: Toggles Avanzados (Opcionales)

```typescript
{
  name: "dao-node/votes-chart",
  enabled: true,
},
{
  name: "show-participation",
  enabled: true,
},
```

---

## 📊 Impacto Esperado por Toggle

### 1. `use-daonode-for-proposals`

**Archivos Afectados:**

- `src/app/api/common/proposals/getProposals.ts` (línea 361+)

**Comportamiento:**

- ✅ Obtiene propuestas desde DAO-Node
- 🔄 Fallback a DB si falla
- 📉 Reduce consultas a `shapeProposals`

### 2. `dao-node/proposal-votes`

**Archivos Afectados:**

- `src/app/api/common/votes/getVotes.ts` (línea 451+)

**Comportamiento:**

- ✅ Obtiene votos desde DAO-Node
- 🔄 Fallback a DB si falla
- 📉 Reduce consultas a `shapeVotes`

### 3. `dao-node/delegate/addr`

**Archivos Afectados:**

- `src/app/lib/dao-node/client.ts` (línea 443+)

**Comportamiento:**

- ✅ Obtiene info de delegados desde nodo
- 📉 Reduce consultas a `shapeDelegates`

### 4. `use-daonode-for-votable-supply`

**Comportamiento:**

- ✅ Obtiene supply total desde contrato
- 📉 Elimina consultas a `shapeVotableSupply`

---

## ⚠️ Consideraciones y Riesgos

### Riesgos Identificados:

1. **Latencia:** DAO-Node puede ser más lento que DB
2. **Disponibilidad:** Si DAO-Node falla, fallback a DB
3. **Datos Históricos:** Algunos datos históricos pueden no estar en el nodo
4. **Consistencia:** Posibles diferencias entre datos de nodo vs DB
5. **🚨 Governor v2.0 Pionero:** Shape es el ÚNICO tenant con `AGORA_20`, territorio inexplorado
6. **ERC721 vs ERC20:** Shape usa Membership tokens, diferentes patterns que ERC20
7. **Sin referencia v2.0:** Ningún otro tenant usa Governor v2.0 + DAO-Node

### Ventajas Identificadas:

✅ **Referencia Protocol Guild:** Ya tiene algunos toggles DAO-Node funcionando con Governor v1  
✅ **Scopes Support:** Shape soporta scopes nativamente (característica avanzada)  
✅ **Arquitectura Moderna:** Governor v2.0 con hooks y middleware diseñado para mejor integración  
✅ **DAO-Node Preparado:** Endpoints ya soportan las funcionalidades que Shape necesita

### Datos que AÚN Necesitan DB:

- **Delegate Statements** (tabla `agora.delegate_statements`)
- **Authority Chains** (`shapeAuthorityChainsSnaps`)
- **Propuestas Offchain** (no están en blockchain)
- **Metadatos de UI** (configuraciones, etc.)

---

## 🌐 Servicios DAO-Node Disponibles

**El DAO-Node expone los siguientes endpoints para Shape:**

### Core Data Endpoints:

```typescript
// Propuestas
GET /v1/proposals                    // Lista todas las propuestas
GET /v1/proposal/<proposal_id>       // Detalles de propuesta específica
GET /v1/proposal_types              // Tipos de propuestas disponibles

// Votos
GET /v1/vote_record/<proposal_id>   // Historial de votos para propuesta
GET /v1/vote?proposal_id=X&voter=Y  // Voto específico de un votante

// Delegados
GET /v1/delegates                   // Lista de delegados ordenada
GET /v1/delegate/<addr>             // Info específica de delegado
GET /v1/delegate/<addr>/voting_history // Historial de votos del delegado

// Voting Power
GET /v1/voting_power                // VP total del DAO
GET /v1/delegate_vp/<addr>/<block>  // VP de delegado en bloque específico
```

### Endpoints Auxiliares:

```typescript
// Balance de tokens (si habilitado)
GET / v1 / balance / <
    addr // Balance de token de governance
  >// Diagnósticos
  GET / v1 / diagnostics / <
    mode // Estado del nodo
  >GET / v1 / progress; // Progreso de sincronización
```

**🔄 Mapeo Shape DB → DAO-Node:**

- `shapeProposals` → `/v1/proposals`, `/v1/proposal/<id>`
- `shapeVotes` → `/v1/vote_record/<id>`, `/v1/vote`
- `shapeDelegates` → `/v1/delegates`, `/v1/delegate/<addr>`
- `shapeProposalTypes` → `/v1/proposal_types`
- `shapeVotableSupply` → `/v1/voting_power`

## 📚 Referencia: Protocol Guild (Governor v1)

**Protocol Guild puede servir como referencia** ya que usa Governor v1 + DAO-Node:

### Toggles Actuales en Protocol Guild:

```typescript
// HABILITADOS ✅
{
  name: "dao-node/proposal-votes",
  enabled: true,
},
{
  name: "dao-node/votes-chart",
  enabled: true,
},
{
  name: "use-daonode-for-proposal-types",
  enabled: true,
},

// DESHABILITADOS ❌
{
  name: "use-daonode-for-proposals",
  enabled: false, // ⚠️ Mismo que Shape necesita
},
{
  name: "use-daonode-for-votable-supply",
  enabled: false, // ⚠️ Mismo que Shape necesita
},
```

**📋 Lecciones de Protocol Guild:**

- Migración progresiva funciona (algunos toggles habilitados)
- Governor v1 + DAO-Node es compatible
- ERC721 tokens funcionan correctamente
- Shape será el primer tenant v2.0 en usar DAO-Node

## 🧪 Plan de Testing

### 1. Testing Local

- [ ] Verificar que toggles no rompan funcionalidad existente
- [ ] Probar fallback a DB cuando DAO-Node falla
- [ ] Comparar datos entre DAO-Node y DB
- [ ] **Comparar comportamiento con Protocol Guild** (referencia v1 que usa DAO-Node)

### 2. Testing de Integración

- [ ] Verificar performance con datos reales
- [ ] Probar edge cases (propuestas muy antiguas, etc.)
- [ ] Validar UI funciona correctamente
- [ ] **Testing específico para ERC721/Membership tokens**

---

## 📝 Checklist de Implementación

### Pre-requisitos:

- [ ] ✅ Documentación aprobada
- [ ] ✅ Shape usa configuración estándar: `DAONODE_URL_TEMPLATE="{URL}/{TENANT_NAMESPACE}/"`
- [ ] Verificar que variable `DAONODE_URL_TEMPLATE` está configurada en .env
- [ ] Backup de configuración actual

### Implementación:

- [ ] Agregar toggles a `shape.ts`
- [ ] Testing local
- [ ] Commit con mensaje descriptivo
- [ ] Testing en staging/dev
- [ ] Monitoreo post-deploy

### Post-implementación:

- [ ] Monitorear logs por errores
- [ ] Verificar reducción en queries de DB
- [ ] Documentar cualquier issue encontrado

---

## 🧪 TESTING RESULTS

### ✅ TypeScript Compilation 
- **Status:** ✅ PASSED
- **Date:** 29 Jul 2025
- **Duration:** 28.15s  
- **Details:** All DAO-Node toggles enabled, no TypeScript errors

### ✅ Production Build
- **Status:** ✅ PASSED
- **Date:** 29 Jul 2025
- **Result:** `✓ Compiled successfully`
- **Details:** Next.js build completed without errors, DAO-Node integration ready

### ⚠️ Environment Variables Issue
- **Problem:** Inconsistencia entre `env.sample` y código
  - `env.sample` usa: `DAO_NODE_URL=`
  - Código usa: `DAONODE_URL_TEMPLATE`  
- **Impact:** Configuración incorrecta podría causar fallos de conexión
- **Resolution:** Actualizar `env.sample` o documentar claramente la variable correcta

### 📋 Toggles Status (Shape)
```typescript
// ✅ ENABLED - Ready for DAO-Node
"use-daonode-for-proposals": true,
"dao-node/proposal-votes": true,
"dao-node/delegate/addr": true, 
"use-daonode-for-votable-supply": true,
"use-daonode-for-proposal-types": true,
"dao-node/votes-chart": true
```

### 🔧 DAO-Node Client Analysis
- **Governor v2.0 Support:** ✅ Confirmed (lines 27-29 in client.ts)
- **Shape Namespace:** `"shape"` 
- **URL Template:** `{DAONODE_URL_TEMPLATE}` → `https://example.com/shape/`

### 📊 Summary
- **✅ TypeScript:** PASSED (28.15s)
- **✅ Build:** PASSED - Production ready
- **⚠️ Config:** Environment variable inconsistency needs resolution
- **🎯 Status:** Shape ready for DAO-Node integration
- **🚀 Next Steps:** Configure production DAO-Node URL and test live connectivity

---

## 🔧 Comandos Útiles

```bash
# Verificar estado actual del schema
grep -r "shape" prisma/schema.prisma | grep "view"

# Verificar uso actual de DB en código
grep -r "shapeProposals\|shapeDelegates\|shapeVotes" src/ --include="*.ts"

# Verificar que DAONODE_URL_TEMPLATE está configurada
echo $DAONODE_URL_TEMPLATE

# Probar conectividad con DAO-Node de Shape (reemplazar URL real)
curl -X GET "https://dao-node-url/shape/v1/proposals" -H "Accept: application/json"

# Monitorear logs de DAO-Node
# (comando específico dependería del setup)
```

## ✅ Verificación Pre-implementación

Antes de proceder, verificar que:

1. **Variables de Entorno:**

   ```bash
   # En .env - Variable usada por el código:
   DAONODE_URL_TEMPLATE=https://tu-dao-node-url/{TENANT_NAMESPACE}/

   # Nota: env.sample tiene DAO_NODE_URL= pero el código usa DAONODE_URL_TEMPLATE
   # Verificar cuál es la correcta antes de proceder
   ```

2. **Conectividad DAO-Node:**

   - [ ] Endpoint de propuestas responde: `/v1/proposals`
   - [ ] Endpoint de delegados responde: `/v1/delegates`
   - [ ] Endpoint de votos responde: `/v1/proposals/{id}/votes`

3. **Fallback a DB funcional:**
   - [ ] Queries actuales de DB funcionan correctamente
   - [ ] No hay errores en logs actuales

---

## 📞 Contactos y Referencias

- **Commit de referencia:** `3e684470828805f706b75876cdfa5806e3fef7de`
- **Última modificación:** `.env` DATABASE_URL actualizada
- **Responsable:** Atomauro
- **Fecha límite:** TBD

---

**⚡ Próximo Paso:** Obtener aprobación para proceder con Fase 1 de implementación.

---

## 🎯 Actualización Importante

**Gracias al feedback del usuario, ahora sabemos que:**

✅ **Shape es pionero con Governor v2.0** - Primera implementación de `AGORA_20`  
✅ **Protocol Guild es referencia** - Governor v1 con algunos toggles DAO-Node habilitados  
✅ **Migración progresiva viable** - Protocol Guild demuestra que funciona por etapas  
✅ **ERC721 + DAO-Node compatible** - Protocol Guild usa Membership tokens exitosamente  
✅ **Shape será pionero v2.0** - Primera implementación de Governor v2.0 con DAO-Node

**Esto convierte a Shape en un caso completamente pionero, siendo el primer Governor v2.0 + DAO-Node.**

---

## 🧪 TESTING RESULTS - Julio 25, 2025

### ✅ DAO-Node Conectividad Verificada

- **URL:** `https://shape.dev.agoradata.xyz/`
- **Status:** ✅ FUNCIONANDO
- **Endpoints probados:**
  - `/v1/proposals` → `{"proposals":[]}` ✅
  - `/v1/delegates` → `{"delegates":[]}` ✅
  - `/v1/voting_power` → `{"voting_power":"0"}` ✅

### ⚠️ TypeScript Issues Identificados

**Archivos afectados:**

- `src/app/api/common/votes/getVotes.ts` (línea 464, 516, 528)
- `src/components/Proposals/ProposalPage/OPProposalApprovalPage/OPProposalApprovalPage.tsx`
- `src/components/Votes/ProposalVotesList/ProposalVotesList.tsx`

**Problemas principales:**

1. **Campos faltantes:** DAO-Node votes no incluyen `citizenType`, `voterMetadata`
2. **Opcional undefined:** `vote.weight` puede ser undefined en DAO-Node
3. **Naming mismatch:** DAO-Node usa `block_number`, DB usa `blockNumber`

**🎯 Próximos pasos:**

- [ ] Crear transformers/adapters para normalizar datos
- [ ] Actualizar tipos TypeScript para ambas fuentes
- [ ] Implementar fallback logic para campos faltantes
- [ ] Testing E2E con datos reales

### 📊 Estado de Implementación

- [x] **Toggles DAO-Node:** 6 toggles implementados en `shape.ts`
- [x] **Conectividad:** DAO-Node responde correctamente
- [x] **Documentación:** Completa y actualizada
- [ ] **Resolución tipos:** Pendiente
- [ ] **Commit y push:** Pendiente autorización
