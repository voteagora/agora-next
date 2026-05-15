/*
 * Parallel font module for the TanStack Start build.
 * Shape-compatible with `src/styles/fonts.ts` (which uses next/font/local) so
 * that at Phase F cutover, switching consumers from `@/styles/fonts` to this
 * module (and deleting the next/font version) is a one-line import change
 * per file.
 *
 * The @font-face rules + variable classes referenced here are defined in
 * `src/styles/fonts.css`, which is imported once from `src/routes/__root.tsx`.
 */

type Font = {
  /** Class name to apply on an element so it defines the CSS variable for this font. */
  variable: string;
  /** Class name that applies the font directly. Mirrors NextFontWithVariable.className. */
  className: string;
  /** Mirrors NextFontWithVariable.style — used in JS when a font-family string is needed. */
  style: { fontFamily: string };
};

export const inter: Font = {
  variable: "font-inter-var",
  className: "font-inter",
  style: { fontFamily: '"Inter", system-ui, sans-serif' },
};

export const rajdhani: Font = {
  variable: "font-rajdhani-var",
  className: "font-rajdhani",
  style: { fontFamily: '"Rajdhani", sans-serif' },
};

export const chivoMono: Font = {
  variable: "font-chivo-mono-var",
  className: "font-chivoMono",
  style: { fontFamily: '"Chivo Mono", ui-monospace, monospace' },
};

export const instrumentSerif: Font = {
  variable: "font-instrument-serif-var",
  className: "font-instrumentSerif",
  style: { fontFamily: '"Instrument Serif", serif' },
};

export const regola: Font = {
  variable: "font-regola-var",
  className: "font-regola",
  style: { fontFamily: '"Regola", sans-serif' },
};

export const fontMapper: Record<string, Font> = {
  "font-inter": inter,
  "font-rajdhani": rajdhani,
  "font-chivoMono": chivoMono,
  "font-instrument-serif": instrumentSerif,
  "font-regola": regola,
};
