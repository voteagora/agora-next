"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { useSIWE } from "connectkit";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Markdown from "@/components/shared/Markdown/Markdown";
import { getStoredSiweJwt, waitForStoredSiweJwt } from "@/lib/siweSession";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/svg+xml",
  "image/webp",
  "application/pdf",
];

const formSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or less"),
    content_markdown: z.string().min(1, "Content is required"),
    author_email: z.string().email("Invalid email address"),
    author_display_name: z.string().optional(),
    author_github: z.string().optional(),
    is_anonymous: z.boolean().default(false),
  })
  .refine(
    (data) =>
      data.is_anonymous ||
      (data.author_display_name && data.author_display_name.trim().length > 0),
    {
      message:
        "Display name is required when you are not submitting anonymously",
      path: ["author_display_name"],
    }
  );

type FormData = z.infer<typeof formSchema>;

interface AttachmentFile {
  file: File;
  label: string;
  preview?: string;
}

export default function NewSubmissionClient() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signIn } = useSIWE();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<{
    id: string;
  } | null>(null);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<
    "unverified" | "pending" | "verified"
  >("unverified");
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content_markdown: "",
      author_email: "",
      author_display_name: "",
      author_github: "",
      is_anonymous: false,
    },
  });

  const isAnonymous = form.watch("is_anonymous");
  const authorEmail = form.watch("author_email");

  useEffect(() => {
    if (!authorEmail || !verifiedEmail) {
      setEmailVerificationStatus("unverified");
      return;
    }

    if (authorEmail.trim().toLowerCase() !== verifiedEmail.toLowerCase()) {
      setEmailVerificationStatus("unverified");
    }
  }, [authorEmail, verifiedEmail]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const currentTotalSize = attachments.reduce(
        (sum, att) => sum + att.file.size,
        0
      );

      const newAttachments: AttachmentFile[] = [];

      for (const file of Array.from(files)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          alert(`File type not accepted: ${file.name}`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          alert(`File too large (max 10MB): ${file.name}`);
          continue;
        }

        if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
          alert("Total attachments size exceeds 50MB limit");
          break;
        }

        const preview = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined;

        newAttachments.push({
          file,
          label: file.name,
          preview,
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
      e.target.value = "";
    },
    [attachments]
  );

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => {
      const removed = prev[index];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!address) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (emailVerificationStatus !== "verified") {
        setSubmitError("Please verify your email before submitting.");
        return;
      }

      if (!turnstileToken) {
        setSubmitError("Please complete the security check before submitting.");
        return;
      }

      let token = getStoredSiweJwt({ expectedAddress: address });
      if (!token) {
        try {
          await signIn();
          token = await waitForStoredSiweJwt({
            expectedAddress: address,
            timeoutMs: 10_000,
            intervalMs: 200,
          });
        } catch {
          setSubmitError("Sign-in cancelled or failed. Please try again.");
          return;
        }

        if (!token) {
          setSubmitError("Session expired. Please sign in to continue.");
          return;
        }
      }

      const attachmentData = await Promise.all(
        attachments.map(async (att) => {
          const buffer = await att.file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          return {
            file: base64,
            filename: att.file.name,
            mime_type: att.file.type,
            label: att.label,
          };
        })
      );

      const response = await fetch("/api/v1/contest/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          attachments: attachmentData,
          turnstile_token: turnstileToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === "DUPLICATE_SUBMISSION") {
          setSubmitError(
            "You have already submitted an entry. Each wallet can only submit once."
          );
        } else if (result.code === "EMAIL_NOT_VERIFIED") {
          setSubmitError(
            "Please verify your email with the magic link before submitting."
          );
        } else {
          setSubmitError(result.error || "Failed to create submission");
        }
        return;
      }

      setTurnstileToken(null);
      turnstileRef.current?.reset();
      setSubmitSuccess({ id: result.id });
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAuthToken = useCallback(async () => {
    if (!address) return null;

    let token = getStoredSiweJwt({ expectedAddress: address });
    if (token) return token;

    await signIn();
    token = await waitForStoredSiweJwt({
      expectedAddress: address,
      timeoutMs: 10_000,
      intervalMs: 200,
    });
    return token;
  }, [address, signIn]);

  const handleSendVerification = useCallback(async () => {
    const email = form.getValues("author_email")?.trim();
    if (!email) {
      setSubmitError("Please enter your email before sending verification.");
      return;
    }

    const emailValidation = z.string().email().safeParse(email);
    if (!emailValidation.success) {
      setSubmitError("Please enter a valid email address.");
      return;
    }

    setIsSendingVerification(true);
    setSubmitError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        setSubmitError("Session expired. Please sign in to continue.");
        return;
      }

      const response = await fetch("/api/v1/contest/submissions/email/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (!response.ok) {
        setSubmitError(result.error || "Failed to send verification email.");
        return;
      }

      setEmailVerificationStatus("pending");
      setVerifiedEmail(null);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      setSubmitError("Failed to send verification email.");
    } finally {
      setIsSendingVerification(false);
    }
  }, [form, getAuthToken]);

  const handleCheckVerification = useCallback(async () => {
    const email = form.getValues("author_email")?.trim();
    if (!email) {
      setSubmitError("Please enter your email before checking verification.");
      return;
    }

    setIsCheckingVerification(true);
    setSubmitError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        setSubmitError("Session expired. Please sign in to continue.");
        return;
      }

      const response = await fetch(
        `/api/v1/contest/submissions/email/verify?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (!response.ok) {
        setSubmitError(result.error || "Failed to check email verification.");
        return;
      }

      if (result.verified) {
        setEmailVerificationStatus("verified");
        setVerifiedEmail(email);
      } else {
        setEmailVerificationStatus("pending");
        setVerifiedEmail(null);
        setSubmitError(
          "Email is not verified yet. Please click the magic link in your inbox."
        );
      }
    } catch (error) {
      console.error("Failed to check email verification:", error);
      setSubmitError("Failed to check email verification status.");
    } finally {
      setIsCheckingVerification(false);
    }
  }, [form, getAuthToken]);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-line">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-wash flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-tertiary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-secondary text-sm mb-6 max-w-md mx-auto">
              You need to connect your wallet to submit a governance design
              proposal.
            </p>
            <div className="flex justify-center">
              <ConnectKitButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-line">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-positive/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-positive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">
              Submission Successful!
            </h2>
            <p className="text-secondary text-sm mb-6">
              Your governance design has been submitted for review.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href={`/submissions/${submitSuccess.id}`}>
                <Button>View Your Submission</Button>
              </Link>
              <Link href="/submissions">
                <Button variant="outline">Browse All Submissions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link
        href="/submissions"
        className="text-sm text-secondary hover:text-primary mb-6 inline-flex items-center gap-1"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Submissions
      </Link>

      <h1 className="text-2xl font-extrabold text-primary mt-4 mb-2">
        Submit Your Design
      </h1>
      <p className="text-secondary mb-8">
        Share your governance design proposal for the Novo Origo Prize.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-line">
            <CardHeader>
              <CardTitle className="text-lg">Proposal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Quadratic Voting with Sybil Guards"
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length}/200 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content_markdown"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel isRequired>Content</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? "Edit" : "Preview"}
                      </Button>
                    </div>
                    <FormControl>
                      {showPreview ? (
                        <div className="min-h-[300px] border border-line rounded-md p-4">
                          <Markdown content={field.value || "*No content*"} />
                        </div>
                      ) : (
                        <Textarea
                          placeholder="Describe your governance design in detail. Markdown is supported."
                          className="min-h-[300px] font-mono text-sm"
                          {...field}
                        />
                      )}
                    </FormControl>
                    <FormDescription>
                      Supports Markdown formatting (headings, lists, code
                      blocks, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Attachments</FormLabel>
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_TYPES.join(",")}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center p-6 border-2 border-dashed border-line rounded-md cursor-pointer hover:border-secondary transition-colors"
                  >
                    <div className="text-center">
                      <svg
                        className="w-8 h-8 text-tertiary mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-secondary">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-tertiary mt-1">
                        PNG, JPG, GIF, SVG, WebP, PDF (max 10MB each, 50MB
                        total)
                      </p>
                    </div>
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((att, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border border-line rounded-md"
                      >
                        {att.preview ? (
                          <img
                            src={att.preview}
                            alt={att.label}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-wash rounded flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-tertiary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Input
                            value={att.label}
                            onChange={(e) => {
                              const newAttachments = [...attachments];
                              newAttachments[index].label = e.target.value;
                              setAttachments(newAttachments);
                            }}
                            placeholder="Label"
                            className="h-8 text-sm"
                          />
                          <p className="text-xs text-tertiary mt-1">
                            {(att.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-line">
            <CardHeader>
              <CardTitle className="text-lg">Author Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="is_anonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-line p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Submit Anonymously</FormLabel>
                      <FormDescription>
                        See how voting power works below.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author_display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired={!isAnonymous}>
                      Display Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {isAnonymous ? (
                        <>
                          Optional. Your submission still appears as anonymous
                          publicly; a name may be used by staff only for contest
                          coordination.
                        </>
                      ) : (
                        <>This will be shown publicly with your submission.</>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author_github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Handle</FormLabel>
                    <FormControl>
                      <Input placeholder="username (without @)" {...field} />
                    </FormControl>
                    <FormDescription>
                      {isAnonymous ? (
                        <>
                          Optional. Not shown publicly on anonymous submissions;
                          may be used by staff only.
                        </>
                      ) : (
                        <>Optional. Will be linked on your submission.</>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel isRequired>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Private — only shared with Agora staff for contest
                      coordination
                    </FormDescription>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSendVerification}
                        loading={isSendingVerification}
                        disabled={
                          isSendingVerification || isCheckingVerification
                        }
                      >
                        {emailVerificationStatus === "pending"
                          ? "Resend Magic Link"
                          : "Send Magic Link"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCheckVerification}
                        loading={isCheckingVerification}
                        disabled={
                          isSendingVerification || isCheckingVerification
                        }
                      >
                        I Have Verified
                      </Button>
                    </div>
                    <p className="text-xs text-secondary">
                      {emailVerificationStatus === "verified"
                        ? "Email verified. You can submit now."
                        : "Verify this email via magic link before submitting."}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-line">
            <CardHeader>
              <CardTitle className="text-lg">How voting power works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-5 space-y-2 text-sm text-secondary">
                <li>
                  <span className="text-primary font-medium">
                    Submitting anonymously:
                  </span>{" "}
                  include your name to receive 1 VP. Anonymous submissions
                  without a name receive 0 VP.
                </li>
                <li>
                  <span className="text-primary font-medium">
                    Submitting identified:
                  </span>{" "}
                  receive 1 VP.
                </li>
              </ul>
              <p className="text-xs text-tertiary">
                Agora may update contest rules if necessary. If anything here
                differs from the official rules, the official rules apply.
              </p>
            </CardContent>
          </Card>

          {submitError && (
            <Card className="border-negative bg-negative/5">
              <CardContent className="py-4">
                <p className="text-sm text-negative">{submitError}</p>
              </CardContent>
            </Card>
          )}

          <Turnstile
            ref={turnstileRef}
            siteKey={"1x00000000000000000000AA"}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-tertiary">
              Connected:{" "}
              <span className="font-mono">
                {address?.substring(0, 6)}...{address?.substring(38)}
              </span>
            </p>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={
                isSubmitting ||
                emailVerificationStatus !== "verified" ||
                !turnstileToken
              }
            >
              {isSubmitting ? "Submitting..." : "Submit Proposal"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
