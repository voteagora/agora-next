import React, {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";

// Avoid resolving to this shim by importing from the package entry via require.

const RawSwaggerUI: ComponentType<any> =
  require("swagger-ui-react").default ?? require("swagger-ui-react");

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

const SwaggerUI = (props: SwaggerUIProps) => {
  return <RawSwaggerUI {...props} />;
};

export default SwaggerUI;
