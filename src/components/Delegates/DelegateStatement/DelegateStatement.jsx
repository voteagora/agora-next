import Markdown from "@/components/shared/Markdown/Markdown";
import { sanitizeContent } from "@/lib/sanitizationUtils";

export default function DelegateStatement({ statement }) {
  const sanitizedStatement = sanitizeContent(statement);

  return (
    <div className="flex flex-col bg-neutral rounded-xl mb-4 p-6 gap-4 border border-line">
      <h2 className="text-2xl font-bold text-primary">Delegate Statement</h2>
      <Markdown content={sanitizedStatement} />
    </div>
  );
}
