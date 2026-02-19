# WebMCP PoC — Model Context Protocol for Agora Governance

## Overview

This document describes the WebMCP Proof-of-Concept integration for Agora, which exposes DAO governance capabilities to AI agents (Claude Desktop, Cursor, Windsurf, etc.) through the [Model Context Protocol](https://modelcontextprotocol.io/).

> **What is WebMCP?** A browser-side library that lets any website register "tools" (actions), "resources" (read-only context), and "prompts" (templates) that MCP-compatible AI agents can discover and call. The agent communicates with the website through a local WebSocket bridge — no API keys or server-side changes needed.

## Architecture

```
┌────────────────┐    WebSocket    ┌──────────────────────────────┐
│  AI Agent      │ ◄─────────────► │  Browser (agora.xyz)         │
│  (Claude, etc) │     (MCP)       │                              │
│                │                 │  ┌── WebMCP Widget ────────┐ │
│  Reads data,   │                 │  │  Tools · Resources ·    │ │
│  asks questions│                 │  │  Prompts                │ │
│                │                 │  └──────────────────────────┘ │
│  No wallet     │                 │  ┌── User's Wallet ────────┐ │
│  No signing    │                 │  │  Already connected       │ │
│                │                 │  └──────────────────────────┘ │
└────────────────┘                 └──────────────────────────────┘
```

**Key principle:** The AI agent is a **copilot**, not an autonomous actor. It reads governance data through the user's browser session. It does not have its own wallet and cannot sign transactions.

## What's Included

### Tools (8 total)

| Tool                     | Type        | Description                                                   |
| ------------------------ | ----------- | ------------------------------------------------------------- |
| `get_proposals`          | Shared      | List governance proposals with filtering and pagination       |
| `get_delegate`           | Shared      | Get delegate profile: voting power, delegators, participation |
| `get_voting_power`       | Shared      | Check voting power for any wallet address                     |
| `get_proposal_votes`     | Shared      | Get vote breakdown for a specific proposal                    |
| `get_delegate_statement` | Shared      | Fetch delegate's governance statement and socials             |
| `get_grants`             | Conditional | List grants/missions (only if tenant has grants enabled)      |
| `get_staking_info`       | Conditional | Staking deposits and delegatees (only if tenant has staking)  |
| `get_forum_topics`       | Conditional | Forum discussion topics (only if tenant has forums toggle)    |

**Shared tools** are available to all tenants. **Conditional tools** auto-register based on each tenant's feature toggles and contract configuration.

### Resources (2)

| Resource           | URI                      | Description                                            |
| ------------------ | ------------------------ | ------------------------------------------------------ |
| `dao-overview`     | `dao://overview`         | DAO name, token symbol, proposal count, votable supply |
| `active-proposals` | `dao://active-proposals` | Currently active/pending proposals                     |

### Prompts (2)

| Prompt                | Description                              |
| --------------------- | ---------------------------------------- |
| `proposal-analysis`   | Guided analysis of a governance proposal |
| `delegate-comparison` | Side-by-side comparison of two delegates |

## Technical Implementation

### File Structure

```
src/lib/webmcp/
├── index.ts                  # Init + tenant-aware registration
├── types.ts                  # MCP type definitions
├── registry.ts               # 3-tier tool assembly (shared + conditional + custom)
├── tools/
│   ├── shared/               # 5 always-registered tools
│   │   ├── getProposals.ts
│   │   ├── getDelegate.ts
│   │   ├── getVotingPower.ts
│   │   ├── getProposalVotes.ts
│   │   └── getDelegateStatement.ts
│   └── conditional/          # 3 per-tenant tools
│       ├── getGrants.ts
│       ├── getStakingInfo.ts
│       └── getForumTopics.ts
├── resources/
│   ├── daoOverview.ts
│   └── activeProposals.ts
├── prompts/
│   ├── proposalAnalysis.ts
│   └── delegateComparison.ts
└── utils/
    ├── formatters.ts         # Markdown response formatters
    └── logger.ts             # Structured telemetry
```

### App Integration

- `WebMcpProvider` client component (`src/components/WebMcpProvider.tsx`)
- Mounted in root layout inside `ClientLayout`
- Renders `null` — no visual impact on the app
- The WebMCP **widget** (small colored square) is injected by the library itself

### Dependencies

- `@jason.today/webmcp` — loaded via `<script>` tag from `public/webmcp.js`
- Webpack cannot bundle this file (conditional CJS export is stripped), so it's served as a static asset
- No additional backend changes required — tools call existing API routes via `fetch()`

### Design Decisions

| Decision                                        | Rationale                                  |
| ----------------------------------------------- | ------------------------------------------ |
| Tools call API routes via `fetch()`             | Zero business logic duplication            |
| Markdown-formatted responses                    | Optimizes LLM token usage                  |
| 3-tier registry (shared → conditional → custom) | Extensible per tenant                      |
| Graceful degradation                            | If WebMCP fails, app works identically     |
| Read-only tools only (PoC)                      | Zero security risk — no wallet interaction |
| Structured telemetry logging                    | Every tool invocation logged with timing   |

## How to Test

### Prerequisites

- Claude Desktop (Pro/Max/Teams) **or** Cursor **or** any MCP-compatible client
- Agora running locally (`npm run dev`)

### Step 1: Set up the WebMCP bridge

Run this once to configure your MCP client:

```bash
# For Claude Desktop:
npx -y @jason.today/webmcp@latest --config claude

# For Cursor:
npx -y @jason.today/webmcp@latest --config cursor
```

This installs the WebSocket bridge as an MCP server in your client's config.

### Step 2: Generate a connection token

Ask Claude/Cursor to generate a WebMCP token, or run:

```bash
npx -y @jason.today/webmcp@latest --new
```

### Step 3: Connect the website

1. Open `http://localhost:3000` in Chrome
2. Look for the small **indigo square** widget in the bottom-right corner
3. Click it → paste the token from Step 2
4. The widget turns to a ✓ when connected

### Step 4: Test with your AI agent

Now ask Claude/Cursor to use the registered tools:

- _"What are the active proposals for this DAO?"_
- _"Get the delegate profile for vitalik.eth"_
- _"Analyze proposal #42"_
- _"Compare delegates 0xABC... and 0xDEF..."_

### Verification Checklist

- [ ] WebMCP widget appears (indigo square, bottom-right)
- [ ] Token input works and connects
- [ ] Console shows `[WebMCP] Initialized for {DAO} ({namespace}) with N tools`
- [ ] AI agent can list available tools
- [ ] `get_proposals` returns formatted Markdown table
- [ ] `get_delegate` returns delegate profile
- [ ] Conditional tools only appear on supported tenants

## Future Considerations

### Phase 2: Wallet Context Resource

Expose connected wallet address, voting power, and chain as a read-only MCP resource. Zero risk, gives agents awareness of who is connected.

### Phase 3: Write Actions (with user approval)

Tools like `cast_vote` or `delegate` that prepare a transaction and trigger the wallet popup. The user always approves the final signature.

### ERC-8004 (Trustless Agents)

For fully autonomous agent voting (agent has its own wallet, receives delegated voting power), ERC-8004 provides the identity, reputation, and validation framework. This is a fundamentally different paradigm from WebMCP's copilot model.

## Branch & Commits

- **Branch:** `feat/webmcp-poc`
- **Commit 1:** `feat: implement WebMCP PoC` — 16 module files, 1302 lines
- **Commit 2:** `refactor: replace CDN → npm` — proper npm import + TypeScript declarations
- **Commit 3:** `fix: use require() for CommonJS WebMCP package`
- **Commit 4:** `fix: load WebMCP via script tag for correct browser init`
