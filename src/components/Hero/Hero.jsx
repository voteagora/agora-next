import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";

export default function Hero() {
  const { namespace, ui } = Tenant.current();
  const { title, description } = ui.page("/");

  return (
    <div className="flex flex-col sm:flex-row justify-between mt-12 mb-0 sm:my-12 w-[76rem] max-w-full sm:max-w-[76rem]">
      <div className="flex flex-col max-w-[36rem] mt-0 mb-8 sm:mb-0">
        <h1 className="font-extrabold text-2xl mb-2">{title}</h1>
        <p className="text-theme-700 text-base">{description}</p>
      </div>
      {ui.hero && (
        <Image
          className="h-[110px] w-auto"
          alt={`${namespace} cover`}
          src={ui.hero}
        />
      )}
    </div>
  );
}
