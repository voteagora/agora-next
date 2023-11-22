import ReactMarkdown from "react-markdown";
import styles from "./markdown.module.scss";
import { cn } from "@/lib/utils";

export default function Markdown({ content }) {
  return (
    <ReactMarkdown className={cn(styles.agora_markdown, "max-w-none", "prose")}>
      {content}
    </ReactMarkdown>
  );
}
