import type { ToolDefinition } from "./types";
import type { TenantNamespace } from "@/lib/types";

import { createGetProposalsTool } from "./tools/shared/getProposals";
import { createGetDelegateTool } from "./tools/shared/getDelegate";
import { createGetVotingPowerTool } from "./tools/shared/getVotingPower";
import { createGetProposalVotesTool } from "./tools/shared/getProposalVotes";
import { createGetDelegateStatementTool } from "./tools/shared/getDelegateStatement";

import { createGetGrantsTool } from "./tools/conditional/getGrants";
import { createGetStakingInfoTool } from "./tools/conditional/getStakingInfo";
import { createGetForumTopicsTool } from "./tools/conditional/getForumTopics";

type TenantContext = {
  namespace: TenantNamespace;
  tokenSymbol: string;
  hasStaker: boolean;
  toggles: {
    grants: boolean;
    forums: boolean;
    retropgf: boolean;
  };
};

const customToolRegistry = new Map<string, ToolDefinition[]>();

export function registerCustomTool(
  namespace: string,
  tool: ToolDefinition
): void {
  const existing = customToolRegistry.get(namespace) ?? [];
  existing.push(tool);
  customToolRegistry.set(namespace, existing);
}

function getSharedTools(
  baseUrl: string,
  tokenSymbol: string
): ToolDefinition[] {
  return [
    createGetProposalsTool(baseUrl),
    createGetDelegateTool(baseUrl),
    createGetVotingPowerTool(baseUrl, tokenSymbol),
    createGetProposalVotesTool(baseUrl),
    createGetDelegateStatementTool(baseUrl),
  ];
}

function getConditionalTools(
  baseUrl: string,
  ctx: TenantContext
): ToolDefinition[] {
  const tools: ToolDefinition[] = [];

  if (ctx.toggles.grants) {
    tools.push(createGetGrantsTool(baseUrl));
  }

  if (ctx.hasStaker) {
    tools.push(createGetStakingInfoTool(baseUrl, ctx.tokenSymbol));
  }

  if (ctx.toggles.forums) {
    tools.push(createGetForumTopicsTool(baseUrl));
  }

  return tools;
}

export function getToolsForTenant(
  baseUrl: string,
  ctx: TenantContext
): ToolDefinition[] {
  return [
    ...getSharedTools(baseUrl, ctx.tokenSymbol),
    ...getConditionalTools(baseUrl, ctx),
    ...(customToolRegistry.get(ctx.namespace) ?? []),
  ];
}
