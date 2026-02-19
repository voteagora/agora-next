import WebMCP from "@jason.today/webmcp/src/webmcp";
import { getToolsForTenant, registerCustomTool } from "./registry";
import { createDaoOverviewResource } from "./resources/daoOverview";
import { createActiveProposalsResource } from "./resources/activeProposals";
import { createProposalAnalysisPrompt } from "./prompts/proposalAnalysis";
import { createDelegateComparisonPrompt } from "./prompts/delegateComparison";
import { createTimedLogger } from "./utils/logger";
import type { TenantNamespace } from "@/lib/types";

type InitOptions = {
  namespace: TenantNamespace;
  brandName: string;
  tokenSymbol: string;
  hasStaker: boolean;
  toggles: {
    grants: boolean;
    forums: boolean;
    retropgf: boolean;
  };
};

let mcpInstance: WebMCP | null = null;

export function getWebMCPInstance(): WebMCP | null {
  return mcpInstance;
}

export function initWebMCP(options: InitOptions): WebMCP | null {
  if (typeof window === "undefined") {
    console.warn("[WebMCP] Not in a browser. Skipping initialization.");
    return null;
  }

  try {
    const mcp = new WebMCP({
      color: "#6366f1",
      position: "bottom-right",
      size: "36px",
      padding: "12px",
    });

    const baseUrl = window.location.origin;
    const { namespace, brandName, tokenSymbol } = options;

    const tools = getToolsForTenant(baseUrl, {
      namespace,
      tokenSymbol,
      hasStaker: options.hasStaker,
      toggles: options.toggles,
    });

    tools.forEach((tool) => {
      const originalHandler = tool.handler;
      mcp.registerTool(
        tool.name,
        tool.description,
        {
          type: "object",
          properties: tool.schema,
        },
        async (args: Record<string, unknown>) => {
          const logger = createTimedLogger(tool.name, args, namespace);
          try {
            const result = await originalHandler(args);
            logger.finish();
            return result;
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            logger.finish(msg);
            throw e;
          }
        }
      );
    });

    const daoOverview = createDaoOverviewResource(
      baseUrl,
      brandName,
      tokenSymbol,
      namespace
    );
    mcp.registerResource(
      daoOverview.name,
      daoOverview.description,
      { uri: daoOverview.uri, mimeType: daoOverview.mimeType },
      daoOverview.handler
    );

    const activeProposals = createActiveProposalsResource(baseUrl, brandName);
    mcp.registerResource(
      activeProposals.name,
      activeProposals.description,
      { uri: activeProposals.uri, mimeType: activeProposals.mimeType },
      activeProposals.handler
    );

    const proposalPrompt = createProposalAnalysisPrompt(baseUrl, brandName);
    mcp.registerPrompt(
      proposalPrompt.name,
      proposalPrompt.description,
      proposalPrompt.arguments,
      proposalPrompt.handler
    );

    const comparePrompt = createDelegateComparisonPrompt(brandName);
    mcp.registerPrompt(
      comparePrompt.name,
      comparePrompt.description,
      comparePrompt.arguments,
      comparePrompt.handler
    );

    mcpInstance = mcp;

    console.info(
      `[WebMCP] Initialized for ${brandName} (${namespace}) with ${tools.length} tools`
    );

    return mcp;
  } catch (e) {
    console.error("[WebMCP] Failed to initialize:", e);
    return null;
  }
}

export { registerCustomTool };
export type { InitOptions };
