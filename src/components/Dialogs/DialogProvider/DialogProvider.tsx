"use client";

import React, { ReactNode, FC } from "react";
import { dialogs, DialogType } from "./dialogs";
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
    <DialogProviderCore dialogDefinitions={dialogs}>
      {children}
    </DialogProviderCore>
  );
};

export { useOpenDialog, useOpenDialogOptional };
export type { DialogType };
