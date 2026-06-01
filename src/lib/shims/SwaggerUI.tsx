import React, { type CSSProperties, type ReactNode } from "react";

// Require the real package via the "swagger-ui-react-impl" alias (configured in
// next.config.js). Requiring "swagger-ui-react" here would match the exact
// alias that points back at this shim, creating a circular reference whose
// half-initialized module object reaches React as an invalid element type.
const rawModule = require("swagger-ui-react-impl");
const RawSwaggerUI: React.ComponentType<any> = rawModule.default ?? rawModule;

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

const SwaggerUI = (props: SwaggerUIProps): JSX.Element => {
  return <RawSwaggerUI {...props} />;
};

export default SwaggerUI;
