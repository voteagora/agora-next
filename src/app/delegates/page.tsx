import Tenant from "@/lib/tenant/tenant";
import React, { Suspense } from "react";
import DelegateCardWrapper, {
  DelegateCardLoadingState,
} from "@/components/Delegates/DelegateCardList/DelegateCardWrapper";
import Hero from "@/components/Hero/Hero";

interface GenerateMetadataProps {
  searchParams?: { [key: string]: string | string[] | undefined };
  params?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({}: GenerateMetadataProps, parent: any) {
  const { ui } = Tenant.current();
  const page = ui.page("delegates");
  const {
    title = "",
    description = "",
    imageTitle = "",
    imageDescription = "",
  } = page?.meta ?? {};

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

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ searchParams }: PageProps) {
  return (
    <section>
      <Hero page="delegates" />
      <Suspense fallback={<DelegateCardLoadingState />}>
        <DelegateCardWrapper searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
