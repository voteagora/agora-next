import Image from "next/image";

export default function Loader() {
  return (
    <div key="loader" className="gl_loader">
      Loading... <br />
      <Image
        src="/images/blink.gif"
        alt="Blinking Agora Logo"
        width={50}
        height={20}
      />
    </div>
  );
}
