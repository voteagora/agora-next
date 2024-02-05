// Header component
import Navbar from "./Navbar";
import { HStack, VStack } from "../Layout/Stack";
import LogoLink from "./LogoLink";
import { getDelegate } from "@/app/api/delegates/getDelegates";
import { ConnectButton } from "./ConnectButton";

async function fetchDelegate(addressOrENSName) {
  "use server";

  return getDelegate({ addressOrENSName });
}

export default function Header() {
  return (
    <VStack>
      <HStack className="flex flex-row w-full items-center">
        <div className="w-full flex justify-start">
          <LogoLink instance_name="Optimism" />
        </div>
        <div className="w-full flex justify-center">
          <Navbar />
        </div>
        <div className="min-w-[24px] sm:w-full flex justify-end">
          <ConnectButton fetchDelegate={fetchDelegate} />
        </div>
      </HStack>
    </VStack>
  );
}
