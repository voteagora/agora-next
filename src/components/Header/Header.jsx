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
      <HStack className="main_header" justifyContent="justify-between">
        <LogoLink instance_name="Optimism" />
        <Navbar />
        <ConnectButton fetchDelegate={fetchDelegate} />
      </HStack>
    </VStack>
  );
}
