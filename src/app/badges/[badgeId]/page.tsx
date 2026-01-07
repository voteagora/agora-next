import Tenant from "@/lib/tenant/tenant";
import React, { Suspense } from "react";
import Hero from "@/components/Hero/Hero";
import { getMetadataBaseUrl } from "@/app/lib/utils/metadata";
import { fetchBadgeDefinition } from "@/app/api/common/badges/getBadges";
import ResourceNotFound from "@/components/shared/ResourceNotFound/ResourceNotFound";
import BadgeDelegateWrapper, {
  BadgeDelegateLoadingState,
} from "./BadgeDelegateWrapper";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: { badgeId: string } },
  parent: any
) {
  const badgeDefinition = await fetchBadgeDefinition(params.badgeId);

  if (!badgeDefinition) {
    return {
      title: "Badge Not Found",
    };
  }

  const { ui } = Tenant.current();
  const page = ui.page("delegates");
  const metadataBase = getMetadataBaseUrl();
  const title = `${badgeDefinition.name} - Badge Holders`;
  const description =
    badgeDefinition.description ||
    `View all delegates with the ${badgeDefinition.name} badge`;
  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

  return {
    metadataBase,
    title: title,
    description: description,
    openGraph: {
      type: "website",
      title: title,
      description: description,
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
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { badgeId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const badgeDefinition = await fetchBadgeDefinition(params.badgeId);

  if (!badgeDefinition) {
    return (
      <ResourceNotFound message="Hmm... can't find that badge, please check again." />
    );
  }

  return (
    <section>
      <Hero page="delegates" />
      <div className="mb-8">
        <h2 className="text-lg font-bold text-primary mb-2">
          Badge Holders for {badgeDefinition.name}
        </h2>
      </div>
      <Suspense fallback={<BadgeDelegateLoadingState />}>
        <BadgeDelegateWrapper
          badgeId={params.badgeId}
          badgeDefinition={badgeDefinition}
          searchParams={searchParams}
        />
      </Suspense>
    </section>
  );
}
