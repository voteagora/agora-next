import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import { VStack } from "@/components/Layout/Stack";
import Markdown from "@/components/shared/Markdown/Markdown";

export default function DelegateStatement({ statement }) {
  return (
    <VStack className="mb-8">
      <h2>Delegate Statement</h2>
      <Markdown content={statement} />
    </VStack>
  );
}
