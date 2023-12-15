import Image from "next/image";
import { HStack } from "./Stack";

export default function Loader() {
  return (
    <HStack
      key="loader"
      className="gl_loader justify-center py-4 text-sm text-stone-500"
    >
      {/* <Image
        src="/images/blink.gif"
        alt="Blinking Agora Logo"
        width={32}
        height={8}
      /> */}
      Loading more items
    </HStack>
  );
}
