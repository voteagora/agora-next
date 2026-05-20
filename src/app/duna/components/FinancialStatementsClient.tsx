"use client";

import { useNavigate } from "@tanstack/react-router";
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
  const navigate = useNavigate();

  const handleStatementClick = (statement: FinancialStatement) => {
    if (statement.topicId && statement.topicTitle) {
      navigate({
        to: buildForumArticlePath(
          statement.topicId,
          statement.topicTitle
        ) as never,
      });
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
