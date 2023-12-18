// import { useAccount } from "wagmi"
import AdminForm from "./components/AdminForm";
// import { useAgoraContext } from "../AgoraContext"

// const whitelistedAddresses = ["0x6EF3E0179e669C77C82664D0feDad3a637121Efe"]

export default function Page() {
  // const { address, isConnecting, isReconnecting } = useAccount()
  // const { isConnected } = useAgoraContext()

  // const isAllowed = isConnected && whitelistedAddresses.includes(address!)

  return (
    <>
      {/* {isAllowed ? ( */}
      <AdminForm />
      {/* ) : isConnecting || isReconnecting ? (
        <p>Loading</p>
      ) : null} */}
    </>
  );
}
