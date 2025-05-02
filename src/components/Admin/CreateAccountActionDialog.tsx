import { useForm, useWatch } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Fragment, useState } from "react";
import toast from "react-hot-toast";
import Tenant from "@/lib/tenant/tenant";
import { useDisconnect, useWriteContract } from "wagmi";
import BlockScanUrls from "@/components/shared/BlockScanUrl";

export function CreateAccountActionDialog({
  closeDialog,
  onSuccess,
}: {
  closeDialog: () => void;
  onSuccess: () => void;
}) {
  const { contracts } = Tenant.current();
  // Get contract to make calls against
  const govContract = contracts.governor;
  const { writeContractAsync } = useWriteContract();
  const { disconnect } = useDisconnect();

  const form = useForm({
    defaultValues: {
      managerAddress: "" as `0x${string}`,
    },
  });

  const [acknowledged, setAcknowledged] = useState(false);

  // Watch the managerAddress field
  const managerAddress = useWatch({
    control: form.control,
    name: "managerAddress",
  });

  // This could be validated further if required
  const addressSupplied = !!managerAddress;

  const onSubmit = async () => {
    try {
      toast.loading("Transferring Role...");
      const values = form.getValues();
      const managerAddressValue = values.managerAddress;

      await writeContractAsync(
        {
          address: govContract?.address as `0x${string}`,
          abi: govContract?.abi,
          functionName: "setManager",
          args: [managerAddressValue],
        },
        {
          onSuccess: (hash) => {
            toast.dismiss();
            toast.success(
              <div className="flex flex-col items-center gap-2 p-1">
                <span className="text-sm font-semibold">
                  Manager Account Transferred
                </span>
                {hash ? <BlockScanUrls hash1={hash} /> : null}
              </div>
            );
            closeDialog();
            disconnect();
            onSuccess();
          },
        }
      );
    } catch (error: unknown) {
      toast.dismiss();
      if (error instanceof Error) {
        toast.error(`Error Transferring Role: ${error.message}`);
        console.error(error);
      } else {
        toast.error("An unknown error occurred while creating the scope.");
      }
    }
  };

  return (
    <Fragment>
      <Form {...form}>
        <form
          className="space-y-8 max-w-2xl mx-auto"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="managerAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Manager Address</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="0x..." className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {acknowledged ? (
            <div>
              {!addressSupplied && (
                <p className="text-sm text-muted-foreground mt-1">
                  Please supply an address
                </p>
              )}
              <Button disabled={!addressSupplied} type="submit">
                Transfer
              </Button>
            </div>
          ) : (
            <Acknowledgement
              handleAcknowledgement={() => setAcknowledged(true)}
            />
          )}
        </form>
      </Form>
    </Fragment>
  );
}

function Acknowledgement({
  handleAcknowledgement,
}: {
  handleAcknowledgement: () => void;
}) {
  return (
    <div>
      <p>
        <span className="text-orange-500">Warning</span>: This action is
        irreversible!
      </p>
      <Button
        variant="outline"
        className="bg-red-100 border-red-500 text-red-500 hover:bg-red-200"
        onClick={handleAcknowledgement}
      >
        Acknowledge
      </Button>
    </div>
  );
}
