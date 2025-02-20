import Markdown from "@/components/shared/Markdown/Markdown";
import { sanitizeContent } from "@/lib/sanitizationUtils";

interface DelegateStatementProps {
  statement: string;
}

export default function DelegateStatement({ statement }: DelegateStatementProps) {
  const sanitizedStatement = sanitizeContent(statement);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-primary">Delegate Statement</h2>
      <Markdown content={sanitizedStatement} />
    </div>
  );
}