/*
 * Vite shim for `next/image`.
 *
 * The real next/image component requires Next.js internals (webpack loader,
 * image optimisation server, etc.) and cannot run inside Vite / TanStack Start.
 * This shim renders a standard <img> element with the same public API so that
 * any component that imports `next/image` continues to work without changes.
 *
 * Intentionally ignored props (no-ops in Vite):
 *   priority, placeholder, blurDataURL, quality, sizes, loader, unoptimized,
 *   onLoadingComplete, fill (partially handled via style)
 */

import React from "react";

export type StaticImageData = {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
};
type StaticImport = StaticImageData;

export interface NextImageProps
  extends Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    "src" | "width" | "height"
  > {
  src: string | StaticImport;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  onLoadingComplete?: (img: HTMLImageElement) => void;
  style?: React.CSSProperties;
}

const NextImageShim = React.forwardRef<HTMLImageElement, NextImageProps>(
  function NextImageShim(
    {
      src,
      alt,
      width,
      height,
      fill,
      // intentionally unused next/image-specific props
      priority: _priority,
      quality: _quality,
      placeholder: _placeholder,
      blurDataURL: _blurDataURL,
      sizes: _sizes,
      onLoadingComplete: _onLoadingComplete,
      style,
      ...rest
    },
    ref
  ) {
    // In Vite SSR, static asset imports (SVG/PNG) may come back as undefined,
    // a namespace object with a `default` key, or a StaticImageData object.
    // Guard every case so SSR rendering doesn't throw.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalised: string | StaticImport | undefined =
      src == null
        ? undefined
        : typeof src === "string"
          ? src
          : typeof (src as any).src === "string"
            ? (src as any).src
            : typeof (src as any).default === "string"
              ? (src as any).default
              : undefined;

    if (!normalised) {
      // Return a placeholder so the DOM stays valid during SSR without crashing.
      return <img ref={ref} alt={alt} style={style} {...rest} />;
    }

    const resolvedSrc =
      typeof normalised === "string" ? normalised : normalised.src;
    const resolvedWidth =
      width ?? (typeof normalised !== "string" ? normalised.width : undefined);
    const resolvedHeight =
      height ??
      (typeof normalised !== "string" ? normalised.height : undefined);
    const numericWidth =
      resolvedWidth !== undefined ? Number(resolvedWidth) : undefined;
    const numericHeight =
      resolvedHeight !== undefined ? Number(resolvedHeight) : undefined;

    const fillStyle: React.CSSProperties = fill
      ? {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }
      : {};

    return (
      <img
        ref={ref}
        src={resolvedSrc}
        alt={alt}
        width={numericWidth}
        height={numericHeight}
        style={{ ...fillStyle, ...style }}
        {...rest}
      />
    );
  }
);

NextImageShim.displayName = "Image";

export default NextImageShim;
