import { useForm } from "react-hook-form";
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
import { useState } from "react";

export function CreateAccountActionDialog() {
  const form = useForm({
    defaultValues: {
      contractAddress: "" as `0x${string}`,
    },
  });

  const [acknowledged, setAcknowledged] = useState(false);

  return (
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
          <Button>Transfer</Button>
        ) : (
          <Aknowledgement handleAcknowledgement={() => setAcknowledged(true)} />
        )}
      </form>
    </Form>
  );
}

function Aknowledgement({
  handleAcknowledgement,
}: {
  handleAcknowledgement: () => void;
}) {
  return (
    <div>
      <p>Warning: This is irreversible</p>
      <Button variant="outline" onClick={handleAcknowledgement}>
        Acknowledge
      </Button>
    </div>
  );
}
