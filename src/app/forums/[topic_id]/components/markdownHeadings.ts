import GithubSlugger from "github-slugger";

// rehype-slug slugifies the rendered HTML text, not raw markdown.
// Strip inline formatting so our slugs match what rehype-slug produces.
function stripInlineMarkdown(text: string): string {
  return (
    text
      // bold+italic: ***x*** or ___x___
      .replace(/\*{3}(.+?)\*{3}/g, "$1")
      .replace(/_{3}(.+?)_{3}/g, "$1")
      // bold: **x** or __x__
      .replace(/\*{2}(.+?)\*{2}/g, "$1")
      .replace(/_{2}(.+?)_{2}/g, "$1")
      // italic: *x* or _x_
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/_(.+?)_/g, "$1")
      // strikethrough: ~~x~~
      .replace(/~~(.+?)~~/g, "$1")
      // inline code: `x`
      .replace(/`(.+?)`/g, "$1")
      // links: [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // images: ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
  );
}

export interface Heading {
  level: number;
  text: string;
  slug: string;
}

export interface TocNode extends Heading {
  children: TocNode[];
}

export function parseHeadings(content: string): Heading[] {
  const slugger = new GithubSlugger();
  const lines = content.split("\n");
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].trim();
    const plainText = stripInlineMarkdown(text);
    headings.push({ level, text, slug: slugger.slug(plainText) });
  }
  return headings;
}

export function buildTocTree(headings: Heading[]): TocNode[] {
  const root: TocNode[] = [];
  const stack: TocNode[] = [];
  for (const h of headings) {
    const node: TocNode = { ...h, children: [] };
    while (stack.length && stack[stack.length - 1].level >= h.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }
  return root;
}

export function hasMarkdownHeadings(content: string): boolean {
  return parseHeadings(content).length > 0;
}
