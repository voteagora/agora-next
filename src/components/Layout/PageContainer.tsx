// Define the layout of the page
// All high level layout styles should be set here
// find their styles in the global.scss file

import React, { ReactNode } from "react";

import { Analytics } from "@vercel/analytics/react";
import { DialogProvider } from "../Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";

type Props = {
  children: ReactNode;
};

const defaults = {
  primaryColor: "#3B82F6",
};

export function PageContainer({ children }: Props) {
  const { ui } = Tenant.current();
  console.log(ui);
  const primaryColor = ui?.customization?.primaryColor || defaults.primaryColor;
  const style = { "--agora-primary": primaryColor } as React.CSSProperties;

  return (
    <DialogProvider>
      <div
        className="container my-4 mx-auto px-4 sm:px-8 sm:min-w-desktop min-h-screen"
        id="root-container"
        style={style}
      >
        <div className="bg-dotted-pattern" />
        <div className="bg-radial-gradient" />
        {children}
        <Analytics />
      </div>
    </DialogProvider>
  );
}
