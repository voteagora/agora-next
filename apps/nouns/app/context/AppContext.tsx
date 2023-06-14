"use client"

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState
} from "react"
import { useAccount, useNetwork, useSignMessage } from "wagmi"

import { message } from "../../utils/signMessage"

type Context = {
  isConnected: boolean
  isSigned: boolean
  setIsSigned: Dispatch<SetStateAction<boolean>>
  signMessageAsync: (args?: any) => Promise<`0x${string}`> | null
  isSignatureLoading: boolean
}

const AppContext = createContext<Context>({
  isConnected: false,
  isSigned: false,
  setIsSigned: () => null,
  signMessageAsync: () => null,
  isSignatureLoading: false
})

export default function AppWrapper({
  children
}: {
  children: React.ReactNode
}) {
  // Hooks
  const { address: account } = useAccount()
  const { chain } = useNetwork()

  // States
  const [isConnected, setIsConnected] = useState(false)
  const [isSigned, setIsSigned] = useState(false)

  // Signature authentication
  const { signMessageAsync, isLoading: isSignatureLoading } = useSignMessage({
    message
  })

  useEffect(() => {
    setIsConnected(Boolean(account))

    if (account) {
      if (account && localStorage.getItem("isSigned") == account) {
        setIsSigned(true)
      } else {
        setIsSigned(false)
        localStorage.removeItem("isSigned")
      }
    } else {
      localStorage.removeItem("isSigned")
    }
  }, [account])

  useEffect(() => {
    setIsConnected(Boolean(account))
  }, [account])

  return (
    <AppContext.Provider
      value={{
        isConnected,
        isSigned,
        setIsSigned,
        signMessageAsync,
        isSignatureLoading
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
