import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import { TENANT_NAMESPACES } from "@/lib/constants";

export default function Hero({ page }) {
  const { namespace, ui } = Tenant.current();
  const { title, description, hero } = ui.page(page);

  // For Protocol Guild proposals/delegates, render nothing (no whitespace)
  if (
    namespace === TENANT_NAMESPACES.PGUILD &&
    (page === "proposals" || page === "delegates")
  ) {
    return <div style={{ height: 24 }} />;
  }

  const shouldHideHero = ui.toggle("hide-hero")?.enabled;

  return (
    <div className="flex-col hidden sm:flex sm:flex-row justify-between mt-12 mb-0 sm:my-12 max-w-full">
      <div className="flex flex-col max-w-[36rem] mt-0 mb-8 sm:mb-0">
        <h1 className="font-extrabold text-2xl mb-2 text-primary">{title}</h1>
        <p className="text-secondary text-base">{description}</p>
      </div>
      {hero && !shouldHideHero && (
        <Image
          className="h-auto sm:h-[110px] w-auto"
          alt={`${namespace} cover`}
          src={hero}
        />
      )}
    </div>
  );
}
