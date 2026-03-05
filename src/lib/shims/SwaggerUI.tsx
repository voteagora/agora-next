import { type CSSProperties, type ReactNode } from "react";

export type SwaggerUIProps = {
  url?: string;
  spec?: Record<string, unknown>;
  docExpansion?: "list" | "full" | "none";
  deepLinking?: boolean;
  presets?: unknown[];
  plugins?: unknown[];
  layout?: string;
  supportedSubmitMethods?: string[];
  defaultModelsExpandDepth?: number;
  defaultModelExpandDepth?: number;
  displayOperationId?: boolean;
  tryItOutEnabled?: boolean;
  requestInterceptor?: (req: unknown) => unknown;
  responseInterceptor?: (res: unknown) => unknown;
  onComplete?: () => void;
  modelPropertyMacro?: () => string;
  parameterMacro?: () => string;
  showMutatedRequest?: boolean;
  docExpansionDepth?: number;
  maxDisplayedTags?: number;
  showExtensions?: boolean;
  filter?: boolean | string;
  validatorUrl?: string | null;
  configs?: Record<string, unknown>;
  customSiteTitle?: string;
  customfavIcon?: string;
  customCss?: string;
  customCssUrl?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

// Re-export the real swagger-ui-react component.
// The webpack alias (swagger-ui-react$ -> this file) is removed;
// instead, only the page that needs it imports this shim directly.
export { default } from "swagger-ui-react-real";
