import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";

export default function Hero({ page }) {
  const { namespace, ui } = Tenant.current();
  const { title, description, hero } = ui.page(page);

  return (
    <div className="flex-col hidden sm:flex sm:flex-row justify-between mt-12 mb-0 sm:my-12 max-w-full">
      <div className="flex flex-col max-w-[36rem] mt-0 mb-8 sm:mb-0">
        <h1 className="font-extrabold text-2xl mb-2 text-primary">{title}</h1>
        <p className="text-secondary text-base">{description}</p>
      </div>
      {hero && (
        <Image
          className="h-auto sm:h-[110px] w-auto"
          alt={`${namespace} cover`}
          src={hero}
        />
      )}
    </div>
  );
}
