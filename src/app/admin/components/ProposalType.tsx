"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { XCircle } from "lucide-react"
import { formatNumber } from "@/lib/utils"
import ProposalTypesConfiguratorAbi from "@/lib/contracts/abis/ProposalTypesConfigurator.json"
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from "wagmi"

type Props = {
  proposalType: ProposalType
  index: number
}

type ProposalType = {
  quorum: number
  approvalThreshold: number
  name: string
}

const proposalTypeSchema = z.object({
  name: z.string(),
  description: z.string(),
  approvalThreshold: z.number().lte(100),
  quorum: z.number().lte(100)
})

const mockVotableSupply = 500000000

export default function ProposalType({
  proposalType: { quorum, approvalThreshold, name },
  index
}: Props) {
  const form = useForm<z.infer<typeof proposalTypeSchema>>({
    resolver: zodResolver(proposalTypeSchema),
    defaultValues: {
      quorum,
      approvalThreshold,
      name,
      description: ""
    }
  })

  const { config: deleteProposalTypeConfig } = usePrepareContractWrite({
    address: "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
    abi: ProposalTypesConfiguratorAbi,
    functionName: "setProposalType",
    args: [index, 0, 0, ""]
  })
  const {
    data: resultDeleteProposalType,
    write: writeDeleteProposalType,
    isLoading: isLoadingDeleteProposalType
  } = useContractWrite(deleteProposalTypeConfig)
  const { isLoading: isLoadingDeleteProposalTypeTransaction } =
    useWaitForTransaction({
      hash: resultDeleteProposalType?.hash
    })

  const formValues = form.getValues()
  const { config: setProposalTypeConfig } = usePrepareContractWrite({
    address: "0x54c943f19c2E983926E2d8c060eF3a956a653aA7",
    abi: ProposalTypesConfiguratorAbi,
    functionName: "setProposalType",
    args: [
      index,
      formValues.quorum,
      formValues.approvalThreshold,
      formValues.name
    ]
  })
  const {
    data: resultSetProposalType,
    write: writeSetProposalType,
    isLoading: isLoadingSetProposalType
  } = useContractWrite(setProposalTypeConfig)
  const { isLoading: isLoadingSetProposalTypeTransaction } =
    useWaitForTransaction({
      hash: resultSetProposalType?.hash
    })
  const isDisabled =
    isLoadingDeleteProposalType ||
    isLoadingDeleteProposalTypeTransaction ||
    isLoadingSetProposalType ||
    isLoadingSetProposalTypeTransaction

  function onSubmit(values: z.infer<typeof proposalTypeSchema>) {
    writeSetProposalType?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-4">
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold">Proposal type {index + 1}</p>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-destructive/10 group w-9 h-9"
              disabled={isDisabled}
              onClick={() => {
                writeDeleteProposalType?.()
              }}
              type="button"
            >
              <XCircle className="w-[18px] h-[18px] text-muted-foreground group-hover:text-destructive" />
            </Button>
          </div>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="quorum"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Quorum</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input
                      {...field}
                      min={0}
                      max={100}
                      step={0.01}
                      type="number"
                    />
                    <div className="absolute right-[12px] text-sm text-muted-foreground grid grid-cols-5 text-center items-center">
                      <p>%</p>
                      <div className="mx-auto w-[1px] bg-muted-foreground/40 h-full" />
                      <p className="text-[0.8rem] col-span-3">
                        {formatNumber(
                          (mockVotableSupply * form.getValues("quorum")) / 100,
                          0,
                          1
                        )}{" "}
                        OP
                      </p>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="approvalThreshold"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Approval threshold</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input
                      {...field}
                      min={0}
                      max={100}
                      step={0.01}
                      type="number"
                    />
                    <div className="absolute right-[12px] text-sm text-muted-foreground grid grid-cols-5 text-center items-center">
                      <p>%</p>
                      <div className="mx-auto w-[1px] bg-muted-foreground/40 h-full" />
                      <p className="text-[0.8rem] col-span-3">
                        {formatNumber(
                          (mockVotableSupply *
                            form.getValues("approvalThreshold")) /
                            100,
                          0,
                          1
                        )}{" "}
                        OP
                      </p>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          variant="outline"
          loading={isDisabled}
          disabled={isDisabled}
        >
          Update proposal type
        </Button>
      </form>
    </Form>
  )
}
