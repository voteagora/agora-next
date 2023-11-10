// Define the layout of the page
// All high level layout styles should be set here
// find their styles in the global.scss file

import React, { ReactNode } from "react";
import { VStack } from "@/components/layout/Stack";
import { Analytics } from "@vercel/analytics/react";

type Props = {
  children: ReactNode;
};

export function PageContainer({ children }: Props) {
  return (
    <VStack alignItems="items-center" className="font-sans">
      <div className="bg-dotted-pattern" />
      <div className="bg-radial-gradient" />
      {children}
      <Analytics />
    </VStack>
  );
}
