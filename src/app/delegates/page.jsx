import Tenant from "@/lib/tenant/tenant";
import React, { Suspense } from "react";
import DelegateCardWrapper, {
  DelegateCardLoadingState,
} from "@/components/Delegates/DelegateCardList/DelegateCardWrapper";
import Hero from "@/components/Hero/Hero";
import SyndicateVotersPageContent from "@/components/Delegates/SyndicateVotersPageContent";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const dynamic = "force-dynamic"; //nuqs does not consider params changes for filters otherwise

export async function generateMetadata({}, parent) {
  const { ui } = Tenant.current();
  const page = ui.page("delegates");
  const { title, description, imageTitle, imageDescription } = page.meta;

  const preview = `/api/images/og/delegates?title=${encodeURIComponent(
    imageTitle
  )}&description=${encodeURIComponent(imageDescription)}`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
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
      {showVotersPageContent && <SyndicateVotersPageContent />}
      <Suspense fallback={<DelegateCardLoadingState />}>
        <DelegateCardWrapper searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
