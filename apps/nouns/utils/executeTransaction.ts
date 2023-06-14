import { NewTransaction } from "@rainbow-me/rainbowkit/dist/transactions/transactionStore"
import { Dispatch, SetStateAction } from "react"
import { createPublicClient, http, Transaction, TransactionReceipt } from "viem"
import { mainnet, sepolia } from "viem/chains"

export type TxData = {
  transactionHash?: string
}

export const executeTransaction = async (
  promise: () => Promise<Transaction>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  txDescription?: string,
  addRecentTransaction?: (transaction: NewTransaction) => void,
  onSuccess?: (waitData: TransactionReceipt) => Promise<any>,
  confetti?: boolean
) => {
  const client = createPublicClient({
    chain: process.env.NEXT_PUBLIC_ENV === "prod" ? mainnet : sepolia,
    transport: http()
  })

  setLoading(true)

  try {
    const tx = await promise()

    if (addRecentTransaction) {
      addRecentTransaction({
        hash: tx.hash,
        description: txDescription || "Transaction executed"
      })
    }

    // TODO: Check if correct with viem
    const waitData = await client.waitForTransactionReceipt({ hash: tx.hash })

    if (confetti) {
      // const launchConfetti = (await import("./launchConfetti")).default
      // launchConfetti()
    }

    if (onSuccess) {
      return await onSuccess(waitData)
    }
  } catch (err) {
    console.log(err)
  }
  setLoading(false)
}
