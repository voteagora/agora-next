"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FeedbackType = "bug" | "feedback";

type FeedbackFormState = {
  type: FeedbackType;
  summary: string;
  details: string;
  pageUrl: string;
  contact: string;
  honeypot: string;
};

const initialState: FeedbackFormState = {
  type: "bug",
  summary: "",
  details: "",
  pageUrl: "",
  contact: "",
  honeypot: "",
};

export default function FeedbackForm({ brandName }: { brandName: string }) {
  const { address } = useAccount();
  const [form, setForm] = useState<FeedbackFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    form.summary.trim().length >= 3 &&
    form.details.trim().length >= 10 &&
    !isSubmitting;

  const updateForm = <K extends keyof FeedbackFormState>(
    key: K,
    value: FeedbackFormState[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          walletAddress: address,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Failed to submit feedback.");
      }

      setSubmitted(true);
      setForm({
        ...initialState,
        contact: form.contact,
      });
      toast.success("Feedback submitted.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit feedback.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-line bg-neutral p-6 shadow-newDefault">
        <h2 className="text-xl font-semibold text-primary">Feedback sent</h2>
        <p className="mt-2 text-sm text-secondary">
          Thanks for helping improve {brandName}.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setError(null);
          }}
        >
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-line bg-neutral p-6 shadow-newDefault"
    >
      <div className="space-y-6">
        <input
          type="text"
          name="honeypot"
          value={form.honeypot}
          onChange={(event) => updateForm("honeypot", event.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div>
          <Label className="text-xs font-semibold text-secondary">Type</Label>
          <div className="mt-2 grid grid-cols-2 rounded-lg border border-line bg-wash p-1">
            {(["bug", "feedback"] as FeedbackType[]).map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={form.type === type}
                onClick={() => updateForm("type", type)}
                className={cn(
                  "h-10 rounded-md text-sm font-medium transition-colors",
                  form.type === type
                    ? "bg-primary text-neutral"
                    : "text-secondary hover:text-primary"
                )}
              >
                {type === "bug" ? "Bug" : "Feedback"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label
            className="text-xs font-semibold text-secondary"
            htmlFor="feedback-summary"
          >
            Summary
          </Label>
          <Input
            id="feedback-summary"
            value={form.summary}
            onChange={(event) => updateForm("summary", event.target.value)}
            maxLength={160}
            required
            placeholder="Something is broken on the proposal page"
            className="mt-2"
          />
        </div>

        <div>
          <Label
            className="text-xs font-semibold text-secondary"
            htmlFor="feedback-details"
          >
            Details
          </Label>
          <Textarea
            id="feedback-details"
            value={form.details}
            onChange={(event) => updateForm("details", event.target.value)}
            maxLength={3000}
            required
            placeholder="What happened? What did you expect instead?"
            className="mt-2 min-h-[160px]"
          />
        </div>

        <div>
          <Label
            className="text-xs font-semibold text-secondary"
            htmlFor="feedback-page-url"
          >
            Page URL
          </Label>
          <Input
            id="feedback-page-url"
            type="text"
            inputMode="url"
            value={form.pageUrl}
            onChange={(event) => updateForm("pageUrl", event.target.value)}
            maxLength={500}
            placeholder="https://vote.optimism.io/proposals/..."
            className="mt-2"
          />
        </div>

        <div>
          <Label
            className="text-xs font-semibold text-secondary"
            htmlFor="feedback-contact"
          >
            Contact
          </Label>
          <Input
            id="feedback-contact"
            value={form.contact}
            onChange={(event) => updateForm("contact", event.target.value)}
            maxLength={200}
            placeholder="Email, Discord, Telegram, or X handle"
            className="mt-2"
          />
        </div>

        {error && (
          <div className="rounded-md border border-negative/30 bg-negative/10 p-3 text-sm text-negative">
            {error}
          </div>
        )}

        <div className="flex justify-end border-t border-line pt-6">
          <Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
}
