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

export function CreateAccountActionDialog() {
  const form = useForm({
    defaultValues: {
      contractAddress: "" as `0x${string}`,
    },
  });

  const [acknowledged, setAcknowledged] = useState(false);

  // Watch the contractAddress field
  const contractAddress = useWatch({
    control: form.control,
    name: "contractAddress",
  });

  const addressSupplied = !!contractAddress;

  return (
    <Fragment>
      <Form {...form}>
        <form className="space-y-8 max-w-2xl mx-auto">
          <FormField
            control={form.control}
            name="contractAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Address</FormLabel>
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
              <Button disabled={!addressSupplied}>Transfer</Button>
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
        <span className="text-orange-500">Warning</span>: This is irreversible
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
