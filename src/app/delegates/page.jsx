import Tenant from "@/lib/tenant/tenant";
import React, { Suspense } from "react";
import DelegateCardWrapper, {
  DelegateCardLoadingState,
} from "@/components/Delegates/DelegateCardList/DelegateCardWrapper";
import Hero from "@/components/Hero/Hero";
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
  return (
    <section>
      <Hero page="delegates" />

      {/* --- INLINE FAKE DRIFT --- */}
      <div className="w-full bg-indigo-600/20 border-y border-indigo-500 text-indigo-400 font-black text-center py-4 my-6 uppercase tracking-widest text-lg shadow-inner z-50">
        [QA-ENGINE] INLINE DRIFT TARGET BLOCK
      </div>

      <Suspense fallback={<DelegateCardLoadingState />}>
        <DelegateCardWrapper searchParams={searchParams} />
      </Suspense>

      {/* --- FLOATING FAKE DRIFT --- */}
      <div className="fixed bottom-10 right-10 z-[9999] bg-gradient-to-tr from-rose-600 to-orange-500 text-white p-5 rounded-box shadow-[0_0_50px_rgba(244,63,94,0.6)] flex items-center justify-center font-black animate-pulse rotate-6 ring-4 ring-white/20 select-none">
        🚨 TARGET B FLOAT 🚨
      </div>

      {/* --- FLOATING CIRCLE DRIFT --- */}
      <div className="fixed top-1/4 left-10 w-32 h-32 z-[9999] bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full shadow-[0_0_40px_rgba(34,211,238,0.8)] border-4 border-white/50 flex items-center justify-center pointer-events-none mix-blend-hard-light animate-bounce">
        <span className="text-white font-black text-xl rotate-12">DRIFT</span>
      </div>
    </section>
  );
}
