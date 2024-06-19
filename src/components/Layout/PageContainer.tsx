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
  primary: "#171717",
  secondary: "#404040",
  tertiary: "#737373",
  neutral: "#FFFFFF",
  wash: "#FAFAFA",
  line: "#EAEAEA",
  veil: "rgba(23, 23, 23, 0.3)",
  positive: "#00992B",
  negative: "#C52F00",
  markup: "#0071DA",
};

const scroll = {
  primary: "#E8BF8B",
  secondary: "#EDCCA2",
  tertiary: "#F1D9B9",
  neutral: "#FFF8F3",
  wash: "#FAF2E8",
  line: "#F6E5D1",
  veil: "rgba(232, 191, 139, 0.3)",
  positive: "#62E3D1",
  negative: "#EB5132",
  markup: "#62E3D1",
};

export function PageContainer({ children }: Props) {
  const { ui } = Tenant.current();

  const primary = ui?.customization?.primary || defaults.primary;
  const secondary = ui?.customization?.secondary || defaults.secondary;
  const tertiary = ui?.customization?.tertiary || defaults.tertiary;
  const neutral = ui?.customization?.neutral || defaults.neutral;
  const wash = ui?.customization?.wash || defaults.wash;
  const line = ui?.customization?.line || defaults.line;
  const veil = ui?.customization?.veil || defaults.veil;
  const positive = ui?.customization?.positive || defaults.positive;
  const negative = ui?.customization?.negative || defaults.negative;
  const markup = ui?.customization?.markup || defaults.markup;

  const style = {
    "--primary": primary,
    "--secondary": secondary,
    "--tertiary": tertiary,
    "--neutral": neutral,
    "--wash": wash,
    "--line": line,
    "--veil": veil,
    "--positive": positive,
    "--negative": negative,
    "--markup": markup,
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
