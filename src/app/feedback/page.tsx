import { buildPageMetadata } from "@/app/lib/utils/metadata";
import Tenant from "@/lib/tenant/tenant";

import FeedbackForm from "./FeedbackForm";

export async function generateMetadata() {
  const { brandName } = Tenant.current();

  return buildPageMetadata({
    title: `Report bugs and feedback - ${brandName} Agora`,
    description: `Share bugs and feedback for ${brandName} Agora.`,
    path: "/feedback",
  });
}

export default function FeedbackPage() {
  const { brandName } = Tenant.current();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold text-primary">
          Report bugs and feedback
        </h1>
        <p className="mt-3 text-base text-secondary">
          Share what happened and any links that help us reproduce it.
        </p>
      </div>
      <FeedbackForm brandName={brandName} />
    </main>
  );
}
