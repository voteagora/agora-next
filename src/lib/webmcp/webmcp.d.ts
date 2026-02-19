/**
 * Type declarations for @jason.today/webmcp (pure JS — no upstream types).
 *
 * We only type the browser-side WebMCP class and the subset of its
 * public API we actually use.  If the upstream ever ships .d.ts we
 * can delete this file.
 */

declare module "@jason.today/webmcp/src/webmcp" {
  interface WebMCPOptions {
    color?: string;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    size?: string;
    padding?: string;
    inactivityTimeout?: number;
  }

  interface ToolInputSchema {
    type: string;
    properties: Record<
      string,
      {
        type: string;
        description?: string;
        enum?: string[];
      }
    >;
    required?: string[];
  }

  interface ToolResult {
    content: Array<{ type: "text"; text: string }>;
  }

  interface ResourceResult {
    contents: Array<{ uri: string; mimeType: string; text: string }>;
  }

  interface PromptArgument {
    name: string;
    description: string;
    required: boolean;
  }

  interface PromptResult {
    messages: Array<{
      role: "user" | "assistant";
      content: { type: "text"; text: string };
    }>;
  }

  class WebMCP {
    constructor(options?: WebMCPOptions);

    registerTool(
      name: string,
      description: string,
      schema: ToolInputSchema,
      executeFn: (
        args: Record<string, unknown>
      ) => ToolResult | Promise<ToolResult>
    ): void;

    registerResource(
      name: string,
      description: string,
      options: { uri?: string; uriTemplate?: string; mimeType: string },
      provideFn: (
        uri: string
      ) => ResourceResult | Promise<ResourceResult>
    ): void;

    registerPrompt(
      name: string,
      description: string,
      promptArgs: PromptArgument[],
      executeFn: (
        args: Record<string, string>
      ) => PromptResult | Promise<PromptResult>
    ): void;

    connect(token: string): void;
    disconnect(): void;

    isConnected: boolean;
  }

  export default WebMCP;
}
