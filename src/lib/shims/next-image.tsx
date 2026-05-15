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

type StaticImport = { src: string; width?: number; height?: number };

export interface NextImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string | StaticImport;
  alt: string;
  width?: number;
  height?: number;
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
    const resolvedSrc = typeof src === "string" ? src : src.src;
    const resolvedWidth = width ?? (typeof src !== "string" ? src.width : undefined);
    const resolvedHeight = height ?? (typeof src !== "string" ? src.height : undefined);

    const fillStyle: React.CSSProperties = fill
      ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
      : {};

    return (
      <img
        ref={ref}
        src={resolvedSrc}
        alt={alt}
        width={resolvedWidth}
        height={resolvedHeight}
        style={{ ...fillStyle, ...style }}
        {...rest}
      />
    );
  }
);

NextImageShim.displayName = "Image";

export default NextImageShim;
