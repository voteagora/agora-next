"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Tenant from "@/lib/tenant/tenant";
import { cn, resolveIPFSUrl } from "@/lib/utils";

type AvatarImageProps = {
  alt: string;
  className?: string;
  imageClassName?: string;
  size?: number;
  src?: string | null;
};

export default function AvatarImage({
  alt,
  className,
  imageClassName,
  size = 32,
  src,
}: AvatarImageProps) {
  const { ui } = Tenant.current();
  const [hasLoadError, setHasLoadError] = useState(false);
  const resolvedSrc = useMemo(() => {
    const trimmedSrc = src?.trim();
    return trimmedSrc ? resolveIPFSUrl(trimmedSrc) : null;
  }, [src]);

  useEffect(() => {
    setHasLoadError(false);
  }, [resolvedSrc]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-full flex justify-center items-center bg-wash shrink-0",
        className
      )}
      style={{ height: size, width: size }}
    >
      {resolvedSrc && !hasLoadError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedSrc}
          alt={alt}
          className={cn("w-full h-full object-cover", imageClassName)}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setHasLoadError(true)}
        />
      ) : (
        <Image
          alt={alt}
          className="animate-in"
          src={ui.assets.delegate}
          width={size}
          height={size}
        />
      )}
    </div>
  );
}
