import { ReactNode } from "react";

type DialogBaseType = { type: string; params: Record<string, any> };

export type DialogDefinitions<U extends DialogBaseType> = {
  [K in U as K["type"]]: (
    params: K["params"],
    closeDialog: () => void
  ) => ReactNode;
};
