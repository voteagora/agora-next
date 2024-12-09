"use client";

import React, { createContext, useContext, useState } from "react";

type Layout = "grid" | "list";

interface LayoutContextValue {
  layout: Layout;
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
}

const LayoutContext = createContext<LayoutContextValue>({
  layout: "grid",
  setLayout: () => {},
});

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<Layout>("grid");

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  );
}

// Custom hook to use the LayoutContext
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
};
