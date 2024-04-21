import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePrepareContractWrite, useContractWrite } from "wagmi";
import Tenant from "@/lib/tenant/tenant";
import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define the Zod schema for form validation
const entrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body content is required"),
  tag: z.string().min(1, "Tag is required"),
});

// Define the form values type using Zod's inference
type FormValues = z.infer<typeof entrySchema>;

export default function AgoraChangelogForm() {
  const { contracts } = Tenant.current();

  // Initialize useForm with Zod schema resolver and default values
  const form = useForm<FormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      body: "",
      tag: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const { config, isError } = usePrepareContractWrite({
    address: contracts.changelog!.address as `0x${string}`,
    abi: contracts.changelog!.abi,
    functionName: "addEntry",
    args: [form.watch("title"), form.watch("body"), form.watch("tag")],
  });

  const { write, isLoading } = useContractWrite({
    ...config,
    onError: (error) => console.error("Contract write failed:", error),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // Check if write function is available before calling
    if (write) {
      write();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 my-4">
        <FormControl>
          <FormLabel>Title</FormLabel>
          <Input
            {...register("title")}
            placeholder="Enter title"
            disabled={isSubmitting || isLoading}
          />
          {errors.title && <FormMessage>{errors.title.message}</FormMessage>}
        </FormControl>
        <FormControl>
          <FormLabel>Body</FormLabel>
          <Input
            {...register("body")}
            placeholder="Enter body content"
            disabled={isSubmitting || isLoading}
          />
          {errors.body && <FormMessage>{errors.body.message}</FormMessage>}
        </FormControl>
        <FormControl>
          <FormLabel>Tag</FormLabel>
          <Input
            {...register("tag")}
            placeholder="Enter tag"
            disabled={isSubmitting || isLoading}
          />
          {errors.tag && <FormMessage>{errors.tag.message}</FormMessage>}
        </FormControl>
        <Button type="submit" disabled={isSubmitting || isLoading || isError}>
          Submit Entry
        </Button>
        {isError && <FormMessage>Error submitting the entry.</FormMessage>}
      </form>
    </Form>
  );
}
