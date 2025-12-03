import Tenant from "@/lib/tenant/tenant";
import React, { Suspense } from "react";
import DelegateCardWrapper, {
  DelegateCardLoadingState,
} from "@/components/Delegates/DelegateCardList/DelegateCardWrapper";
import Hero from "@/components/Hero/Hero";
import { LearnMoreLink } from "@/components/shared/LearnMoreLink";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { getMetadataBaseUrl } from "@/app/lib/utils/metadata";

export const dynamic = "force-dynamic"; //nuqs does not consider params changes for filters otherwise

export async function generateMetadata({}, parent) {
  const { ui } = Tenant.current();
  const page = ui.page("delegates");
  const { title, description, imageTitle, imageDescription } = page.meta;

  const metadataBase = getMetadataBaseUrl();
  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    imageTitle
  )}&description=${encodeURIComponent(imageDescription)}`;

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

export default async function Page({ searchParams }) {
  const { ui, namespace } = Tenant.current();
  const showVotersPageContent =
    namespace === TENANT_NAMESPACES.SYNDICATE &&
    ui.toggle("syndicate-voters-page-content")?.enabled;

  return (
    <section>
      <Hero page="delegates" />
      {showVotersPageContent && (
        <LearnMoreLink
          href="/info#voting-guide"
          text="Learn about voting power & delegation"
          description="Self-delegation, delegating to others, and DUNA membership"
        />
      )}
      <Suspense fallback={<DelegateCardLoadingState />}>
        <DelegateCardWrapper searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
