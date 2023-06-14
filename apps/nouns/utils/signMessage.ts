import { Dispatch, SetStateAction } from "react"
import { ByteArray, Hex, verifyMessage } from "viem"

export const message = `Sign this message to prove you have access to the connected wallet. This won't cost you any Ether.

Timestamp: ${Date.now()}`

export async function signMessage(
  accountAddress: `0x${string}`,
  signMessage: (args?: any) => Promise<Hex | ByteArray> | null,
  setIsSigned: Dispatch<SetStateAction<boolean>>
) {
  const signature = await signMessage()

  if (
    signature &&
    (await verifyMessage({ address: accountAddress, message, signature }))
  ) {
    setIsSigned(true)
    localStorage.setItem("isSigned", accountAddress)
  }
}
