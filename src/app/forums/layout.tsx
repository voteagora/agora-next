import type { ReactNode } from "react";
import { ForumSubscriptionsProvider } from "@/contexts/ForumSubscriptionsContext";

export default function ForumsLayout({ children }: { children: ReactNode }) {
  return <ForumSubscriptionsProvider>{children}</ForumSubscriptionsProvider>;
}
