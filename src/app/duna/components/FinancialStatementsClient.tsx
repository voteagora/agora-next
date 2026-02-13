"use client";

import { useRouter } from "next/navigation";
import FinancialStatementsSection from "./FinancialStatementsSection";
import { buildForumArticlePath } from "@/lib/forumUtils";

interface FinancialStatement {
  id: number;
  name: string;
  url: string;
  ipfsCid: string;
  createdAt: string;
  uploadedBy: string;
  archived?: boolean;
  revealTime?: string | null;
  expirationTime?: string | null;
  topicId?: number;
  topicTitle?: string;
}

interface FinancialStatementsClientProps {
  statements: FinancialStatement[];
  title: string;
}

export default function FinancialStatementsClient({
  statements,
  title,
}: FinancialStatementsClientProps) {
  const router = useRouter();

  const handleStatementClick = (statement: FinancialStatement) => {
    if (statement.topicId && statement.topicTitle) {
      router.push(
        buildForumArticlePath(statement.topicId, statement.topicTitle)
      );
    }
  };

  return (
    <FinancialStatementsSection
      statements={statements}
      onStatementClick={handleStatementClick}
      title={title}
    />
  );
}
