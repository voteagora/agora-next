"use client";

import FinancialStatementsSection from "./FinancialStatementsSection";

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
}

interface FinancialStatementsClientProps {
  statements: FinancialStatement[];
  title: string;
}

export default function FinancialStatementsClient({
  statements,
  title,
}: FinancialStatementsClientProps) {
  const handleStatementClick = (statement: FinancialStatement) => {
    if (statement.url) {
      window.open(statement.url, "_blank");
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
