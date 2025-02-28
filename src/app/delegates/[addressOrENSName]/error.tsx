"use client"; // Error boundaries must be Client Components

import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";

export default function NotFound() {
  return <ResourceNotFound message="Can't find that delegate." />;
}
