"use client";

import { createContext, useContext, useState } from "react";

type Direction = "prev" | "next";

interface DirectionContextType {
  direction: Direction;
  setDirection: (direction: Direction) => void;
}

const DirectionContext = createContext<DirectionContextType | undefined>(
  undefined
);

export function useDirection() {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error(
      "useDirection must be used within an AnimationDirectionProvider"
    );
  }
  return context;
}

export function AnimationDirectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [direction, setDirection] = useState<Direction>("next");

  return (
    <DirectionContext.Provider value={{ direction, setDirection }}>
      {children}
    </DirectionContext.Provider>
  );
}

export default AnimationDirectionProvider;
