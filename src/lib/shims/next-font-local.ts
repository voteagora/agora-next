/*
 * Vite shim for `next/font/local`. The real package only runs inside Next's
 * build; Vite/Rollup can't execute it. This shim returns a `NextFontWithVariable`-
 * shaped object so any source that imports next/font/local resolves cleanly.
 *
 * Visual fidelity comes from `src/styles/fonts.css` (loaded once from the
 * TanStack root), which declares all the same @font-face rules.
 */

type LocalFontOptions = {
  src?: unknown;
  variable?: string;
  display?: string;
  weight?: string;
  style?: string;
};

type NextFontShim = {
  className: string;
  variable: string;
  style: { fontFamily: string; fontWeight?: string; fontStyle?: string };
};

export default function localFont(
  options: LocalFontOptions = {}
): NextFontShim {
  // Use the requested CSS variable name as both the class and the variable so
  // that downstream consumers (className={font.variable}) keep working.
  const variable = options.variable ?? "--font-shim";
  const className = variable.replace(/^--/, "");
  return {
    className,
    variable: className,
    style: {
      fontFamily: `var(${variable})`,
      fontWeight: options.weight,
      fontStyle: options.style,
    },
  };
}
