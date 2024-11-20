import Tenant from "@/lib/tenant/tenant";
import React, { Suspense } from "react";
import Image from "next/image";
import DelegateCardWrapper, {
  DelegateCardLoadingState,
} from "@/components/Delegates/DelegateCardList/DelegateCardWrapper";
import nsPassport from "@/assets/tenant/ns_passport.png";

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
  return (
    <section>
      <div className="bg-stone-50 w-full flex-col sm:flex-row my-8 border rounded-xl flex">
        <div className="sm:w-2/5 flex align-center justify-center">
          <Image className="w-80" alt={""} src={nsPassport} />
        </div>
        <div className="sm:w-3/5 border-l p-6 flex flex-col justify-center items-center">
          <div className="max-w-md flex flex-col gap-3">
            <div className="text-2xl font-extrabold">
              Mint your passport to join the network state
            </div>
            <div className="text-stone-700">
              From magic Internet money to magic internet votes, mint your
              passport to vote. The cost of your passport will be used to fund
              the Network State activities.
            </div>
            <div className="bg-white rounded-2xl border shadow-sm flex px-2 py-2 items-center gap-4 max-w-sm flex-col sm:flex-row">
              <div className="bg-black text-white p-3 rounded-lg whitespace-nowrap">
                Mint my passport
              </div>
              <div className="text-sm text-stone-500">
                $100 contribution to the network state
              </div>
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={<DelegateCardLoadingState />}>
        <DelegateCardWrapper searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
