import Tenant from "@/lib/tenant/tenant";
import Image from "next/image";
import styles from "./hero.module.scss";

export default function Hero() {
  const { namespace, ui } = Tenant.current();
  const { title, description } = ui.page("/");

  return (
    <div className={`flex flex-row justify-between ${styles.hero_container}`}>
      <div className={`flex flex-col ${styles.content_container}`}>
        <h1>{title}</h1>
        <p> {description}</p>
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
