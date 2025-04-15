// Define the layout of the page
// All high level layout styles should be set here
// find their styles in the global.scss file

import React, { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { DialogProvider } from "../Dialogs/DialogProvider/DialogProvider";

type Props = {
  children: ReactNode;
};

export function PageContainer({ children }: Props) {
  return (
    <DialogProvider>
      <div
        className="max-w-[1280px] mx-auto my-3 sm:my-4 px-3 sm:px-8 min-h-screen"
        id="root-container"
      >
        <div className="bg-dotted-pattern" />
        <div className="bg-radial-gradient" />
        {children}
        <Analytics />
      </div>
    </DialogProvider>
  );
}
