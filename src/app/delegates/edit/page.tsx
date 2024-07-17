import CurrentDelegateStatement from "@/components/DelegateStatement/CurrentDelegateStatement";
import Tenant from "@/lib/tenant/tenant";

export async function generateMetadata({}) {
  const { ui } = Tenant.current();
  const page = ui.page("delegates");
  const { title, description } = page!.meta;

  const preview = `/api/images/og/delegates?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

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

export default async function Page() {
  return <CurrentDelegateStatement />;
}
