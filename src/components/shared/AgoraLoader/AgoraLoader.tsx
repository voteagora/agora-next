import logo from "@/assets/agora_logo.svg";
import Image from "next/image";
import { VStack } from "@/components/Layout/Stack";

export default function AgoraLoader() {
  return (
    <VStack
      justifyContent="justify-center"
      alignItems="items-center"
      className="min-h-screen animate-pulse"
    >
      <Image alt="loading" width={24} height={24} src={logo} />
    </VStack>
  );
}

export function AgoraLoaderSmall() {
  return (
    <VStack
      justifyContent="justify-center"
      alignItems="items-center"
      className="w-full h-full animate-pulse"
    >
      <Image alt="loading" width={24} height={24} src={logo} />
    </VStack>
  );
}
