export type McpTextContent = {
  type: "text";
  text: string;
};

export type McpToolResult = {
  content: McpTextContent[];
};

export type McpToolSchema = Record<
  string,
  {
    type: string;
    description?: string;
    enum?: string[];
  }
>;

export type McpToolHandler = (
  args: Record<string, unknown>
) => McpToolResult | Promise<McpToolResult>;

export type ToolDefinition = {
  name: string;
  description: string;
  schema: McpToolSchema;
  handler: McpToolHandler;
};

export type McpResourceResult = {
  contents: Array<{
    uri: string;
    mimeType: string;
    text: string;
  }>;
};

export type ResourceDefinition = {
  name: string;
  description: string;
  uri: string;
  mimeType: string;
  handler: (uri: string) => McpResourceResult | Promise<McpResourceResult>;
};

export type McpPromptMessage = {
  role: "user" | "assistant";
  content: {
    type: "text";
    text: string;
  };
};

export type McpPromptResult = {
  messages: McpPromptMessage[];
};

export type PromptArgument = {
  name: string;
  description: string;
  required: boolean;
};

export type PromptDefinition = {
  name: string;
  description: string;
  arguments: PromptArgument[];
  handler: (
    args: Record<string, string>
  ) => McpPromptResult | Promise<McpPromptResult>;
};
