import React from "react";
import { ForumPermissionsProvider } from "@/contexts/ForumPermissionsContext";

export default function ForumsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ForumPermissionsProvider>{children}</ForumPermissionsProvider>;
}
