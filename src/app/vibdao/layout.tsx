import type { ReactNode } from "react";
import { Shell } from "@/components/vibdao/Shell";
import "./vibdao.css";

export default function VibDaoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="vibdao-root">
      <Shell>{children}</Shell>
    </div>
  );
}
