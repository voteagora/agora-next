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
  theme50: "FAFAFA",
  theme100: "E0E0E0",
  theme500: "#AFAFAF",
  theme700: "#4F4F4F",
  theme900: "#000000",
};

export function PageContainer({ children }: Props) {
  const { ui } = Tenant.current();
  console.log(ui);

  const theme50 = ui?.customization?.theme50 || defaults.theme50;
  const theme100 = ui?.customization?.theme100 || defaults.theme100;
  const theme500 = ui?.customization?.theme500 || defaults.theme500;
  const theme700 = ui?.customization?.theme700 || defaults.theme700;
  const theme900 = ui?.customization?.theme900 || defaults.theme900;

  const style = {
    "--theme-50": theme50,
    "--theme-100": theme100,
    "--theme-500": theme500,
    "--theme-700": theme700,
    "--theme-900": theme900,
  } as React.CSSProperties;

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
