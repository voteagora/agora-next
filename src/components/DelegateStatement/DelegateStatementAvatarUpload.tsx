"use client";

import { type ChangeEvent, useCallback, useRef, useState } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { useAccount } from "wagmi";
import AvatarImage from "@/components/shared/AvatarImage";
import { Button } from "@/components/ui/button";
import { useEnsureSiweSession } from "@/hooks/useEnsureSiweSession";
import { uploadProfileImage } from "@/lib/actions/profileImage";
import { convertFileToAttachmentData } from "@/lib/fileUtils";
import {
  MAX_PROFILE_IMAGE_BYTES,
  PROFILE_IMAGE_CONTENT_TYPES,
} from "@/lib/profileImage";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";

const ACCEPTED_TYPES: readonly string[] = PROFILE_IMAGE_CONTENT_TYPES;
const MAX_SIZE_MB = Math.floor(MAX_PROFILE_IMAGE_BYTES / 1024 / 1024);

export default function DelegateStatementAvatarUpload({
  form,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
}) {
  const { address, chain } = useAccount();
  const { ensureSiweSession, isSigningIn } = useEnsureSiweSession({
    address,
    chainId: chain?.id,
    purpose: "delegate_statement",
  });
  const avatar = useWatch({ control: form.control, name: "avatar" });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = isUploading || isSigningIn;

  const doUpload = useCallback(
    async (file: File, jwt: string) => {
      if (!address) {
        throw new Error("Connect your wallet to upload an image.");
      }

      const attachmentData = await convertFileToAttachmentData(file);
      const result = await uploadProfileImage(attachmentData, address, {
        jwt,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      form.setValue("avatar", result.url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [address, form]
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      // Reset so the same file can be picked again after an error
      event.target.value = "";
      if (!file) {
        return;
      }

      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Unsupported file type. Use a JPEG, PNG, WebP or GIF image.");
        return;
      }

      if (file.size > MAX_PROFILE_IMAGE_BYTES) {
        setError(`Image must be smaller than ${MAX_SIZE_MB} MB.`);
        return;
      }

      if (!address) {
        setError("Connect your wallet to upload an image.");
        return;
      }

      setIsUploading(true);
      try {
        const jwt = await ensureSiweSession({
          onSafeAuthenticated: async (safeJwt) => {
            setIsUploading(true);
            try {
              await doUpload(file, safeJwt);
            } catch (uploadError) {
              setError(
                uploadError instanceof Error
                  ? uploadError.message
                  : "Failed to upload image."
              );
            } finally {
              setIsUploading(false);
            }
          },
          onSafeClosed: (reason) => {
            setError(
              reason === "expired"
                ? "The Safe sign-in flow expired. Please try again."
                : "Safe sign-in was cancelled or failed."
            );
          },
        });

        if (!jwt) {
          // Safe wallets continue in the dialog callbacks above
          return;
        }

        await doUpload(file, jwt);
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload image."
        );
      } finally {
        setIsUploading(false);
      }
    },
    [address, doUpload, ensureSiweSession]
  );

  const handleRemove = useCallback(() => {
    setError(null);
    form.setValue("avatar", "", { shouldDirty: true, shouldValidate: true });
  }, [form]);

  return (
    <div>
      <h4 className="font-semibold text-xs mb-1 text-secondary">Avatar</h4>
      <div className="flex items-center gap-4">
        <AvatarImage src={avatar} alt="Avatar preview" size={64} />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={handleFileChange}
              disabled={isBusy}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={isBusy}
            >
              {isUploading
                ? "Uploading..."
                : avatar
                  ? "Replace image"
                  : "Upload image"}
            </Button>
            {avatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isBusy}
              >
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-secondary">
            JPEG, PNG, WebP or GIF, up to {MAX_SIZE_MB} MB.
          </p>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
