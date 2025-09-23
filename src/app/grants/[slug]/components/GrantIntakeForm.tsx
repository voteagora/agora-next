"use client";

import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Comprehensive form schema with all input types
const grantFormSchema = z.object({
  // Text inputs
  name: z.string().min(1, "Name is required"),
  telegramHandle: z.string().min(1, "Telegram handle is required"),
  email: z.string().email("Please enter a valid email address"),
  organization: z.string().optional(),

  // Dropdown selections
  grantCategory: z.string().min(1, "Please select a grant category"),
  projectType: z.string().min(1, "Please select a project type"),
  fundingAmount: z.string().min(1, "Please select a funding amount"),
  timeline: z.string().min(1, "Please select a project timeline"),

  // Textarea inputs
  projectDescription: z
    .string()
    .min(50, "Please provide at least 50 characters describing your project"),
  impactStatement: z
    .string()
    .min(
      50,
      "Please provide at least 50 characters describing the expected impact"
    ),
  budgetBreakdown: z.string().min(20, "Please provide a budget breakdown"),
  previousExperience: z
    .string()
    .min(20, "Please describe your relevant experience"),

  // Checkbox inputs
  agreeToTerms: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must agree to the terms and conditions"
    ),
  agreeToPrivacy: z
    .boolean()
    .refine((val) => val === true, "You must agree to the privacy policy"),
  confirmAccuracy: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must confirm the accuracy of your information"
    ),
  allowContact: z.boolean().default(false),
});

type GrantFormData = z.infer<typeof grantFormSchema>;

interface Grant {
  id: string;
  title: string;
  description: string;
  slug: string;
  active: boolean;
  budget: string;
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
    defaultValues: {
      allowContact: false,
    },
  });

  const onSubmit = async (data: GrantFormData) => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to submit the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement actual form submission to backend with wallet signature
      // For now, simulate submission
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Log submission details (will be replaced with API call)
      console.log("Grant Application Submission:", {
        grant: grant.title,
        applicant: {
          name: data.name,
          email: data.email,
          telegramHandle: data.telegramHandle,
          organization: data.organization,
          walletAddress: address,
        },
        project: {
          category: data.grantCategory,
          type: data.projectType,
          fundingAmount: data.fundingAmount,
          timeline: data.timeline,
          description: data.projectDescription,
          impactStatement: data.impactStatement,
          budgetBreakdown: data.budgetBreakdown,
          previousExperience: data.previousExperience,
        },
        agreements: {
          terms: data.agreeToTerms,
          privacy: data.agreeToPrivacy,
          accuracy: data.confirmAccuracy,
          allowContact: data.allowContact,
        },
        submittedAt: new Date().toISOString(),
      });

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary border-b border-line pb-2">
            Personal Information
          </h3>

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
                htmlFor="organization"
                className="block text-sm font-medium text-primary mb-2"
              >
                Organization (Optional)
              </label>
              <input
                {...register("organization")}
                type="text"
                id="organization"
                className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Your organization or company"
              />
            </div>
          </div>
        </div>

        {/* Project Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary border-b border-line pb-2">
            Project Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="grantCategory"
                className="block text-sm font-medium text-primary mb-2"
              >
                Grant Category *
              </label>
              <select
                {...register("grantCategory")}
                id="grantCategory"
                className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select a category</option>
                <option value="marketing">Marketing & Events</option>
                <option value="development">Development & Technical</option>
                <option value="research">Research & Academic</option>
                <option value="community">Community Building</option>
                <option value="education">Education & Training</option>
              </select>
              {errors.grantCategory && (
                <p className="mt-1 text-sm text-negative">
                  {errors.grantCategory.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="projectType"
                className="block text-sm font-medium text-primary mb-2"
              >
                Project Type *
              </label>
              <select
                {...register("projectType")}
                id="projectType"
                className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select project type</option>
                <option value="one-time">One-time Project</option>
                <option value="ongoing">Ongoing Initiative</option>
                <option value="research">Research Project</option>
                <option value="event">Event or Conference</option>
                <option value="tool">Tool or Platform</option>
              </select>
              {errors.projectType && (
                <p className="mt-1 text-sm text-negative">
                  {errors.projectType.message}
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

            <div>
              <label
                htmlFor="timeline"
                className="block text-sm font-medium text-primary mb-2"
              >
                Project Timeline *
              </label>
              <select
                {...register("timeline")}
                id="timeline"
                className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select timeline</option>
                <option value="1-3-months">1-3 months</option>
                <option value="3-6-months">3-6 months</option>
                <option value="6-12-months">6-12 months</option>
                <option value="over-12-months">Over 12 months</option>
              </select>
              {errors.timeline && (
                <p className="mt-1 text-sm text-negative">
                  {errors.timeline.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary border-b border-line pb-2">
            Detailed Information
          </h3>

          <div className="space-y-6">
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
                rows={6}
                className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Describe your project in detail. What are you building? What problem does it solve?"
              />
              {errors.projectDescription && (
                <p className="mt-1 text-sm text-negative">
                  {errors.projectDescription.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="impactStatement"
                className="block text-sm font-medium text-primary mb-2"
              >
                Expected Impact *
              </label>
              <textarea
                {...register("impactStatement")}
                id="impactStatement"
                rows={4}
                className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="How will this project benefit the Syndicate Network ecosystem? What measurable impact do you expect?"
              />
              {errors.impactStatement && (
                <p className="mt-1 text-sm text-negative">
                  {errors.impactStatement.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="budgetBreakdown"
                className="block text-sm font-medium text-primary mb-2"
              >
                Budget Breakdown *
              </label>
              <textarea
                {...register("budgetBreakdown")}
                id="budgetBreakdown"
                rows={4}
                className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Provide a detailed breakdown of how the funding will be used (e.g., development costs, marketing, team salaries, etc.)"
              />
              {errors.budgetBreakdown && (
                <p className="mt-1 text-sm text-negative">
                  {errors.budgetBreakdown.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="previousExperience"
                className="block text-sm font-medium text-primary mb-2"
              >
                Relevant Experience *
              </label>
              <textarea
                {...register("previousExperience")}
                id="previousExperience"
                rows={4}
                className="w-full px-3 py-2 border border-line rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Describe your relevant experience and qualifications for this project"
              />
              {errors.previousExperience && (
                <p className="mt-1 text-sm text-negative">
                  {errors.previousExperience.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Agreements Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-primary border-b border-line pb-2">
            Agreements
          </h3>

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

            <div className="flex items-start">
              <input
                {...register("confirmAccuracy")}
                type="checkbox"
                id="confirmAccuracy"
                className="mt-1 mr-3"
              />
              <label
                htmlFor="confirmAccuracy"
                className="text-sm text-tertiary"
              >
                I confirm that all information provided is accurate and complete
                *
              </label>
            </div>
            {errors.confirmAccuracy && (
              <p className="text-sm text-negative">
                {errors.confirmAccuracy.message}
              </p>
            )}

            <div className="flex items-start">
              <input
                {...register("allowContact")}
                type="checkbox"
                id="allowContact"
                className="mt-1 mr-3"
              />
              <label htmlFor="allowContact" className="text-sm text-tertiary">
                I allow Syndicate Network to contact me for follow-up questions
                (optional)
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-line">
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
