import Markdown from "@/components/shared/Markdown/Markdown";

export default function DelegateStatement({ statement }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-primary">Delegate Statement</h2>
      <Markdown content={statement} />
    </div>
  );
}
