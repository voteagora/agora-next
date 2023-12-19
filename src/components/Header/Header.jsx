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

// function DesktopConnectButton() {
//   return (
//     <ConnectKitButton.Custom>
//       {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
//         return (
//           <button onClick={show} className={styles.desktop_connect_button}>
//             {isConnected ? (
//               <div className={styles.desktop_connect_button_inner}>
//                 <div className={styles.testing}>
//                   <ENSAvatar ensName={ensName} />
//                 </div>

//                 <HumanAddress address={address} />
//               </div>
//             ) : (
//               "Connect Wallet"
//             )}
//           </button>
//         );
//       }}
//     </ConnectKitButton.Custom>
//   );
// }
