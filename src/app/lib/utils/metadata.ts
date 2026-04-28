import type { Metadata } from "next";
import { headers } from "next/headers";

type BuildPageMetadataParams = {
  title: string;
  description: string;
  path: string;
  imageTitle?: string;
  imageDescription?: string;
  robots?: Metadata["robots"];
};

/**
 * Get the base URL for the current request
 * Used for metadataBase in Next.js metadata generation
 */
export function getMetadataBaseUrl(): URL {
  const headerList = headers();
  const forwardedHost = headerList.get("x-forwarded-host");
  const host = forwardedHost || headerList.get("host") || "localhost:3000";
  const protoHeader = headerList.get("x-forwarded-proto");
  const protocol =
    protoHeader || (host && host.startsWith("localhost") ? "http" : "https");

  return new URL(`${protocol}://${host}`);
}

export function buildPageMetadata({
  title,
  description,
  path,
  imageTitle = title,
  imageDescription = description,
  robots,
}: BuildPageMetadataParams): Metadata {
  const metadataBase = getMetadataBaseUrl();
  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    imageTitle
  )}&description=${encodeURIComponent(imageDescription)}`;

  return {
    metadataBase,
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: path,
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [preview],
    },
    robots,
  };
}
