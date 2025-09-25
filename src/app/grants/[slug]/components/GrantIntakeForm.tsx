"use client";

import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Simplified form schema with essential fields only
const grantFormSchema = z.object({
  // Basic info
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  telegramHandle: z.string().min(1, "Telegram handle is required"),

  // Project info
  projectDescription: z
    .string()
    .min(30, "Please provide at least 30 characters describing your project"),
  fundingAmount: z.string().min(1, "Please select a funding amount"),

  // Agreements
  agreeToTerms: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must agree to the terms and conditions"
    ),
  agreeToPrivacy: z
    .boolean()
    .refine((val) => val === true, "You must agree to the privacy policy"),
});

type GrantFormData = z.infer<typeof grantFormSchema>;

interface Grant {
  id: string;
  title: string;
  description: string;
  slug: string;
  active: boolean;
  budgetRange: string;
  deadline: string;
  requirements: string[];
}

interface GrantIntakeFormProps {
  grant: Grant;
}

export default function GrantIntakeForm({ grant }: GrantIntakeFormProps) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<GrantFormData>({
    resolver: zodResolver(grantFormSchema),
    mode: "onChange", // Enable real-time validation
  });

  const onSubmit = async (data: GrantFormData) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to submit the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to API
      const response = await fetch(`/api/grants/${grant.slug}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          applicantAddress: address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      const result = await response.json();
      console.log("Application submitted successfully:", result);

      // Redirect to thank you page after successful submission
      router.push(`/grants/${grant.slug}/thank-you`);
    } catch (error) {
      console.error("Error submitting grant application:", error);
      toast.error(
        "There was an error submitting your application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectWallet = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    } else {
      toast.error("No wallet connectors available");
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnectWallet}
        className="w-full px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium"
      >
        Connect Wallet to Apply for This Grant
      </button>
    );
  }

  return (
    <div className="bg-white border border-line rounded-lg p-8">
      <h2 className="text-xl font-semibold text-primary mb-6">
        Submit Application for {grant.title}
      </h2>

      <p className="text-tertiary mb-6">
        Fill in the details below to submit your grant application. All
        applications are private until accepted.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-primary mb-2"
            >
              Full Name *
            </label>
            <input
              {...register("name")}
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-negative">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-primary mb-2"
            >
              Email Address *
            </label>
            <input
              {...register("email")}
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-negative">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="telegramHandle"
              className="block text-sm font-medium text-primary mb-2"
            >
              Telegram Handle *
            </label>
            <input
              {...register("telegramHandle")}
              type="text"
              id="telegramHandle"
              className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="@yourtelegramhandle"
            />
            {errors.telegramHandle && (
              <p className="mt-1 text-sm text-negative">
                {errors.telegramHandle.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="fundingAmount"
              className="block text-sm font-medium text-primary mb-2"
            >
              Requested Funding Amount *
            </label>
            <select
              {...register("fundingAmount")}
              id="fundingAmount"
              className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select amount</option>
              <option value="under-5k">Under $5,000</option>
              <option value="5k-10k">$5,000 - $10,000</option>
              <option value="10k-25k">$10,000 - $25,000</option>
              <option value="25k-50k">$25,000 - $50,000</option>
              <option value="over-50k">Over $50,000</option>
            </select>
            {errors.fundingAmount && (
              <p className="mt-1 text-sm text-negative">
                {errors.fundingAmount.message}
              </p>
            )}
          </div>
        </div>

        {/* Project Description */}
        <div>
          <label
            htmlFor="projectDescription"
            className="block text-sm font-medium text-primary mb-2"
          >
            Project Description *
          </label>
          <textarea
            {...register("projectDescription")}
            id="projectDescription"
            rows={4}
            className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="Describe your project in detail. What are you building? What problem does it solve?"
          />
          {errors.projectDescription && (
            <p className="mt-1 text-sm text-negative">
              {errors.projectDescription.message}
            </p>
          )}
        </div>

        {/* Agreements */}
        <div className="space-y-4">
          <div className="flex items-start">
            <input
              {...register("agreeToTerms")}
              type="checkbox"
              id="agreeToTerms"
              className="mt-1 mr-3"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-tertiary">
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                Terms and Conditions
              </a>{" "}
              *
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm text-negative">
              {errors.agreeToTerms.message}
            </p>
          )}

          <div className="flex items-start">
            <input
              {...register("agreeToPrivacy")}
              type="checkbox"
              id="agreeToPrivacy"
              className="mt-1 mr-3"
            />
            <label htmlFor="agreeToPrivacy" className="text-sm text-tertiary">
              I agree to the{" "}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>{" "}
              *
            </label>
          </div>
          {errors.agreeToPrivacy && (
            <p className="text-sm text-negative">
              {errors.agreeToPrivacy.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-line">
        <div className="bg-wash rounded-lg p-4">
          <h4 className="font-semibold text-primary mb-2">Important Notes:</h4>
          <ul className="text-sm text-tertiary space-y-1">
            <li>• All applications are private until accepted</li>
            <li>• Once submitted, you cannot edit your application</li>
            <li>
              • You will receive an email confirmation with your submission
              details
            </li>
            <li>• Applications are reviewed on a rolling basis</li>
            <li>
              • Make sure you follow us on{" "}
              <a
                href="https://x.com/SyndicateProtocol"
                className="text-primary hover:underline"
              >
                @syndicateCollective
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
