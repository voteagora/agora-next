import { getToolsForTenant, registerCustomTool } from "./registry";
import { createDaoOverviewResource } from "./resources/daoOverview";
import { createActiveProposalsResource } from "./resources/activeProposals";
import { createProposalAnalysisPrompt } from "./prompts/proposalAnalysis";
import { createDelegateComparisonPrompt } from "./prompts/delegateComparison";
import { createTimedLogger } from "./utils/logger";
import type { TenantNamespace } from "@/lib/types";
import type {
  McpToolResult,
  McpResourceResult,
  McpPromptResult,
  PromptArgument,
} from "./types";

/**
 * Minimal interface for the WebMCP class instance.
 * The package is pure JS loaded via script tag — no upstream types.
 */
interface WebMCPInstance {
  registerTool(
    name: string,
    description: string,
    schema: { type: string; properties: Record<string, unknown> },
    handler: (
      args: Record<string, unknown>
    ) => McpToolResult | Promise<McpToolResult>
  ): void;
  registerResource(
    name: string,
    description: string,
    options: { uri?: string; uriTemplate?: string; mimeType: string },
    handler: (uri: string) => McpResourceResult | Promise<McpResourceResult>
  ): void;
  registerPrompt(
    name: string,
    description: string,
    args: PromptArgument[],
    handler: (
      args: Record<string, string>
    ) => McpPromptResult | Promise<McpPromptResult>
  ): void;
}

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

let mcpInstance: WebMCPInstance | null = null;

export function getWebMCPInstance(): WebMCPInstance | null {
  return mcpInstance;
}

/**
 * Load webmcp.js via script tag (the canonical approach for this browser widget).
 * The npm package is a plain JS file with `module.exports = WebMCP` wrapped
 * in a conditional guard — webpack strips this during bundling, so we serve
 * the file from /public and let the browser evaluate it as a global script.
 */
function loadWebMCPScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded?
    if ((window as any).WebMCP) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "/webmcp.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load /webmcp.js"));
    document.head.appendChild(script);
  });
}

/**
 * Inject the Agora logo SVG into the WebMCP trigger button.
 * The trigger is a plain div created by the library — we replace
 * its content with the Agora icon (white fill on black bg).
 */
function _injectAgoraLogo(): void {
  // Small delay to ensure the WebMCP widget DOM is ready
  setTimeout(() => {
    const trigger = document.querySelector(
      ".webmcp-trigger"
    ) as HTMLElement | null;
    if (!trigger) return;

    trigger.style.borderRadius = "8px";
    trigger.innerHTML = `<svg width="22" height="22" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
      <path d="M66.7028 73.3883C65.6846 102.044 66.1063 130.814 66.7131 157.629C67.0731 169.683 75.5588 176.801 89.4137 176.626H90.864C91.0183 176.626 91.1623 176.626 91.3166 176.626C104.914 176.626 113.215 169.55 113.575 157.618C114.192 131.009 114.614 102.384 113.585 73.3883C113.153 60.0683 101.191 55.3266 90.144 55.3163C79.1074 55.3163 67.1554 60.0683 66.7028 73.3781V73.3883Z" fill="white"/>
      <path d="M23.5646 51.5211H9.00006C6.46977 51.5108 4.40234 53.5679 4.40234 56.1085V175.845C4.40234 178.375 6.45949 180.442 9.00006 180.442H23.5646C37.8515 180.442 49.4743 168.819 49.4743 154.533V77.4411C49.4743 63.1542 37.8515 51.5313 23.5646 51.5313V51.5211Z" fill="white"/>
      <path d="M173.211 0H6.65484C4.11427 0 2.05713 2.05714 2.05713 4.59771V15.2023C2.05713 29.4891 13.68 41.112 27.9668 41.112H50.2148C50.3074 41.1017 50.4514 41.1017 50.6571 41.1017C50.7806 41.1017 50.9451 41.1017 51.1406 41.0914H51.2023H51.264C51.6343 41.112 52.0148 41.112 52.3954 41.112C52.5497 41.112 52.776 41.112 53.0331 41.1017H54.1131C54.3086 41.112 54.5657 41.112 54.8948 41.0914H54.9566H55.0183C55.3166 41.1017 55.6046 41.112 55.9028 41.1017C56.0674 41.1017 56.2731 41.1017 56.5406 41.0811H56.6023H56.664C57.0548 41.0914 57.3531 41.1017 57.6926 41.1017C57.8263 41.1017 57.9703 41.1017 58.1554 41.0914H58.2171H58.2788C58.6491 41.112 59.0194 41.112 59.4103 41.112C59.5851 41.112 59.7908 41.112 60.0377 41.0914H60.0994H60.1611C60.4903 41.1017 60.84 41.1223 61.1794 41.112C61.4057 41.112 61.6628 41.112 61.9714 41.0914H62.0331H62.1051C62.3623 41.1017 62.64 41.0914 62.8868 41.1017C63.0514 41.1017 63.2366 41.1017 63.4423 41.0914H63.4834H63.5554C63.936 41.1017 64.2857 41.112 64.656 41.112C64.8308 41.112 65.0366 41.112 65.2526 41.0914H65.3143H65.376C65.7051 41.1017 66.0446 41.112 66.3737 41.112C66.6103 41.112 66.8777 41.112 67.1966 41.0914H67.2583H67.32C67.5771 41.1017 67.8446 41.0914 68.1017 41.1017C68.2868 41.1017 68.5234 41.1017 68.7806 41.0811H68.8423H68.9143C69.2948 41.0914 69.5623 41.0914 69.84 41.1017C70.0046 41.1017 70.2 41.1017 70.416 41.0914C70.8994 41.1017 71.2697 41.112 71.6297 41.112C71.8148 41.112 72.0206 41.112 72.2468 41.0914H72.3188H72.3908C72.72 41.1017 73.0285 41.112 73.3577 41.112C73.5428 41.112 73.7486 41.112 73.9748 41.0914H74.0366H74.0983C74.4377 41.1017 74.7668 41.112 75.0857 41.112C75.3223 41.112 75.6103 41.112 75.8983 41.0914H75.96H76.0217C76.2788 41.1017 76.5463 41.112 76.7931 41.1017C76.9783 41.1017 77.1737 41.1017 77.4 41.0914H77.4617H77.5234C77.8834 41.112 78.2023 41.112 78.5314 41.112C78.7988 41.112 79.1074 41.112 79.4263 41.0914H79.488H79.5497C79.7965 41.1017 80.0434 41.112 80.2697 41.1017C80.4857 41.1017 80.7428 41.1017 81.0103 41.0811H81.072H81.1337C81.5246 41.0914 81.7817 41.1017 82.0697 41.1017C82.2548 41.1017 82.4503 41.1017 82.6663 41.0914H82.728H82.7897C83.1291 41.112 83.4686 41.1223 83.7771 41.112C84.0137 41.112 84.2708 41.112 84.5588 41.0914H84.6206H84.6823C85.0217 41.1017 85.3097 41.112 85.5771 41.112C85.824 41.112 86.0606 41.112 86.328 41.0914H86.3897H86.4514C86.7908 41.1017 87.0686 41.112 87.336 41.112C87.5623 41.112 87.7988 41.112 88.056 41.0914H88.1177H88.1794C88.5188 41.1017 88.7965 41.112 89.0743 41.112C89.3108 41.112 89.5474 41.112 89.8046 41.0914H89.8663H89.928C90.2777 41.1017 90.5451 41.112 90.8331 41.112C91.1108 41.112 91.3988 41.112 91.6868 41.0914H92.4994C92.7566 41.1017 93.0137 41.1017 93.2914 41.0811H93.3531H93.4148C93.8057 41.0914 94.0526 41.1017 94.32 41.1017C94.5463 41.1017 94.8034 41.1017 95.0503 41.0811H95.112H95.2971C95.5646 41.0914 95.8011 41.1017 96.0377 41.1017C96.2537 41.1017 96.4697 41.1017 96.7063 41.0914H96.768H96.8811C97.1897 41.112 97.4777 41.112 97.7554 41.112C98.0228 41.112 98.3108 41.112 98.5988 41.0914H98.6606H98.7223C99.0206 41.1017 99.3086 41.112 99.5657 41.112C99.8228 41.112 100.07 41.112 100.327 41.0914H100.389H100.45C100.81 41.1017 101.047 41.1223 101.273 41.112C101.489 41.112 101.746 41.112 101.973 41.1017H102.034H102.096C102.405 41.1223 102.703 41.1223 102.97 41.1223C103.351 41.1223 103.742 41.112 104.153 41.0811H104.719C105.017 41.0811 105.305 41.0811 105.614 41.0606H105.675H105.737C106.046 41.0709 106.293 41.0811 106.519 41.0811C106.786 41.0811 107.054 41.0811 107.342 41.0606H107.403H107.465C107.774 41.0709 108.021 41.0811 108.247 41.0811C108.494 41.0811 108.751 41.0811 109.018 41.0709H109.08H109.142C109.45 41.0914 109.718 41.0811 109.965 41.0914C110.242 41.0914 110.53 41.0914 110.818 41.0709H110.88H110.952C111.271 41.0811 111.518 41.0914 111.744 41.0914C112.022 41.0914 112.31 41.0914 112.598 41.0709H112.659H112.721C113.091 41.0811 113.297 41.0914 113.513 41.0914C113.791 41.0914 114.089 41.0914 114.377 41.0709H114.439H114.501C114.84 41.0811 115.066 41.1017 115.262 41.0914C115.539 41.0914 115.827 41.0914 116.115 41.0709H116.177H116.373C116.609 41.0709 116.805 41.0811 116.99 41.0914C117.329 41.0914 117.669 41.0914 118.018 41.0709H118.08H118.142C118.337 41.0709 118.512 41.0709 118.687 41.0709C118.995 41.0709 119.325 41.0709 119.643 41.0503H119.705H119.767C120.096 41.0606 120.312 41.0811 120.497 41.0709C120.795 41.0709 121.104 41.0709 121.423 41.0503H121.485H121.68C121.886 41.0503 122.05 41.0709 122.215 41.0709C122.472 41.0709 122.75 41.0709 123.017 41.0606H123.079H123.141C123.459 41.0811 123.717 41.0914 123.933 41.0811C124.262 41.0811 124.581 41.0811 124.93 41.0606H124.992H125.177C125.414 41.0606 125.599 41.0811 125.753 41.0811C126.062 41.0811 126.36 41.0811 126.679 41.0606H126.741H126.977C127.193 41.0606 127.358 41.0811 127.491 41.0709C127.841 41.0709 128.211 41.0709 128.561 41.0503H128.623H128.685C128.89 41.0606 129.086 41.0709 129.219 41.0606C129.487 41.0606 129.775 41.0606 130.053 41.0503L131.174 41.0091V41.0811L151.91 41.1017C166.197 41.1017 177.819 29.4789 177.819 15.192V4.59771C177.819 2.06743 175.762 0 173.222 0H173.211Z" fill="white"/>
      <path d="M171.309 51.511H156.744C142.457 51.511 130.834 63.1338 130.834 77.4207V154.512C130.834 168.799 142.457 180.422 156.744 180.422H171.309C173.839 180.422 175.906 178.365 175.906 175.824V56.1087C175.906 53.5784 173.849 51.511 171.309 51.511Z" fill="white"/>
    </svg>`;
  }, 100);
}

export async function initWebMCP(
  options: InitOptions
): Promise<WebMCPInstance | null> {
  if (typeof window === "undefined") {
    console.warn("[WebMCP] Not in a browser. Skipping initialization.");
    return null;
  }

  try {
    // Load the script and wait for it to register window.WebMCP
    await loadWebMCPScript();

    const WebMCPClass = (window as any).WebMCP;
    if (!WebMCPClass) {
      console.error("[WebMCP] window.WebMCP not available after script load");
      return null;
    }

    const mcp: WebMCPInstance = new WebMCPClass({
      color: "#000000",
      position: "bottom-right",
      size: "36px",
      padding: "12px",
    });

    // Inject Agora logo into the trigger button
    _injectAgoraLogo();

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
      `[WebMCP] ✅ Initialized for ${brandName} (${namespace}) with ${tools.length} tools`
    );

    return mcp;
  } catch (e) {
    console.error("[WebMCP] ❌ Failed to initialize:", e);
    return null;
  }
}

export { registerCustomTool };
export type { InitOptions, WebMCPInstance };
