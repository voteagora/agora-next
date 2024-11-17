import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";

export default function Hero() {
  const { namespace, ui } = Tenant.current();
  const { title, description, hero } = ui.page("/");

  return (
    <div className="relative rounded-3xl">
      {" "}
      <Image
        className="h-auto w-full py-8 rounded-[32px]"
        alt={`${namespace} cover`}
        src={hero}
      />
      <div className="absolute top-36 left-12 flex flex-col sm:flex-row justify-between mt-12 mb-0 sm:my-12 max-w-full">
        <div className="flex flex-col mt-0 mb-8 sm:mb-0">
          <h1 className=" text-4xl text-white drop-shadow-lg font-serif">
            {title}
          </h1>
          <p className="text-white opacity-80 drop-shadow-lg">{description}</p>
        </div>
      </div>
    </div>
  );
}
