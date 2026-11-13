"use server";

import Tenant from "@/lib/tenant/tenant";
import { verifyAuth, type AuthParams } from "@/lib/auth/authHelpers";
import { type AttachmentData } from "@/lib/fileUtils";
import { MAX_PROFILE_IMAGE_BYTES } from "@/lib/profileImage";
import {
  getProfileImageUrl,
  uploadProfileImage as uploadProfileImageToBucket,
} from "@/lib/profileImageStorage";
import {
  ALLOWED_PROFILE_IMAGE_CONTENT_TYPES,
  decodeBase64Upload,
  sniffImageContentType,
  validateUploadBuffer,
  validateUploadRateLimit,
} from "@/lib/uploadValidation";

export type UploadProfileImageResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadProfileImage(
  attachmentData: AttachmentData,
  address: `0x${string}`,
  auth: AuthParams
): Promise<UploadProfileImageResult> {
  try {
    const authResult = await verifyAuth(auth, address);
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }

    const { ui } = Tenant.current();
    if (!ui.toggle("delegates/profile-metadata")?.enabled) {
      return {
        success: false,
        error: "Profile images are not enabled for this tenant",
      };
    }

    const authenticatedAddress = authResult.address.toLowerCase();

    const rateLimitError = validateUploadRateLimit({
      address: authenticatedAddress,
      scope: "profile-image",
    });
    if (rateLimitError) {
      return { success: false, error: rateLimitError };
    }

    const buffer = decodeBase64Upload(attachmentData.base64Data);
    const validationError = validateUploadBuffer({
      buffer,
      contentType: attachmentData.contentType,
      allowedContentTypes: ALLOWED_PROFILE_IMAGE_CONTENT_TYPES,
      maxBytes: MAX_PROFILE_IMAGE_BYTES,
    });
    if (validationError) {
      return { success: false, error: validationError };
    }

    if (sniffImageContentType(buffer) !== attachmentData.contentType) {
      return {
        success: false,
        error: "File contents do not match the declared image type",
      };
    }

    const objectName = await uploadProfileImageToBucket(
      buffer,
      attachmentData.contentType,
      authenticatedAddress
    );

    return { success: true, url: getProfileImageUrl(objectName) };
  } catch (error) {
    console.error("Profile image upload failed:", error);
    return {
      success: false,
      error: "Failed to upload image. Please try again.",
    };
  }
}
