"use client";

import React, { ReactNode, FC } from "react";
import type { DialogType } from "./dialogs";
import {
  DialogProviderCore,
  useOpenDialog,
  useOpenDialogOptional,
} from "./DialogProviderCore";

type Props = {
  children: ReactNode;
};

export const DialogProvider: FC<Props> = ({ children }) => {
  return (
    <DialogProviderCore
      loadDialogDefinitions={async () => {
        const { dialogs } = await import("./dialogs");
        return dialogs;
      }}
    >
      {children}
    </DialogProviderCore>
  );
};

export { useOpenDialog, useOpenDialogOptional };
export type { DialogType };
