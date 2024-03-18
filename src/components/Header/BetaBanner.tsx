import Link from "next/link";
import Tenant from "@/lib/tenant/tenant";

export default function BetaBanner() {
  const tenant = Tenant.current();
  if (
    tenant.ui.toggle("betabanner") &&
    tenant.ui.toggle("betabanner").enabled
  ) {
    return (
      <div className="relative isolate bg-orange-200 px-6 py-2 sm:px-3.5 sm:min-w-desktop">
        <div className="flex justify-center items-center h-full">
          <p className="font-medium text-xs leading-4 text-orange-800 text-center">
            Welcome to the next version of Agora 👋. Please report bugs and
            feedback{" "}
            <a
              rel="noopener"
              href="https://app.deform.cc/form/7180b273-7662-4f96-9e66-1eae240a52bc/"
              target="_blank"
              className="underline"
            >
              using this form.
            </a>{" "}
            Follow the{" "}
            <Link className="underline" href="/changelog">
              changelog
            </Link>{" "}
            for updates.
          </p>
        </div>
      </div>
    );
  }
  return null;
}
