import { beforeEach, describe, expect, it, vi } from "vitest";

import { uploadProfileImage } from "./profileImage";

const { toggleMock, uploadMock, verifyAuthMock } = vi.hoisted(() => ({
  toggleMock: vi.fn(),
  uploadMock: vi.fn(),
  verifyAuthMock: vi.fn(),
}));

vi.mock("@/lib/auth/authHelpers", () => ({
  verifyAuth: verifyAuthMock,
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      slug: "CIVIC",
      ui: {
        toggle: toggleMock,
      },
    }),
  },
}));

vi.mock("@/lib/profileImageStorage", () => ({
  uploadProfileImage: uploadMock,
  getProfileImageUrl: (objectName: string) =>
    `https://agora-x-civic.twic.pics/images/${objectName}`,
}));

const address = "0xAbCdEf1234567890123456789012345678901234" as const;
const auth = { jwt: "jwt-token" };

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function makeImage(header: number[], length = 64): Buffer {
  const buffer = Buffer.alloc(length);
  Buffer.from(header).copy(buffer);
  return buffer;
}

function attachment(buffer: Buffer, contentType: string) {
  return {
    fileName: "avatar.png",
    contentType,
    fileSize: buffer.length,
    base64Data: buffer.toString("base64"),
  };
}

describe("uploadProfileImage action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyAuthMock.mockResolvedValue({ success: true, address });
    toggleMock.mockReturnValue({ enabled: true });
    uploadMock.mockResolvedValue("profile-images/0xabc/uuid.png");
  });

  it("rejects when authentication fails", async () => {
    verifyAuthMock.mockResolvedValue({
      success: false,
      error: "Invalid token",
    });

    const result = await uploadProfileImage(
      attachment(makeImage(PNG_SIGNATURE), "image/png"),
      address,
      auth
    );

    expect(result).toEqual({ success: false, error: "Invalid token" });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("rejects when the tenant does not manage profile metadata", async () => {
    toggleMock.mockReturnValue({ enabled: false });

    const result = await uploadProfileImage(
      attachment(makeImage(PNG_SIGNATURE), "image/png"),
      address,
      auth
    );

    expect(result.success).toBe(false);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported content types", async () => {
    const result = await uploadProfileImage(
      attachment(
        Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"),
        "image/svg+xml"
      ),
      address,
      auth
    );

    expect(result).toEqual({ success: false, error: "Unsupported file type" });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("rejects images larger than 5 MB", async () => {
    const result = await uploadProfileImage(
      attachment(makeImage(PNG_SIGNATURE, 5 * 1024 * 1024 + 1), "image/png"),
      address,
      auth
    );

    expect(result).toEqual({
      success: false,
      error: "File size exceeds the 5MB limit",
    });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("rejects files whose bytes do not match the declared type", async () => {
    const result = await uploadProfileImage(
      attachment(makeImage(PNG_SIGNATURE), "image/jpeg"),
      address,
      auth
    );

    expect(result).toEqual({
      success: false,
      error: "File contents do not match the declared image type",
    });
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it("uploads a valid image and returns its TwicPics URL", async () => {
    const buffer = makeImage(PNG_SIGNATURE);

    const result = await uploadProfileImage(
      attachment(buffer, "image/png"),
      address,
      auth
    );

    expect(result).toEqual({
      success: true,
      url: "https://agora-x-civic.twic.pics/images/profile-images/0xabc/uuid.png",
    });
    expect(uploadMock).toHaveBeenCalledTimes(1);
    const [uploadedBuffer, contentType, uploadAddress] =
      uploadMock.mock.calls[0];
    expect(Buffer.isBuffer(uploadedBuffer)).toBe(true);
    expect(uploadedBuffer.equals(buffer)).toBe(true);
    expect(contentType).toBe("image/png");
    expect(uploadAddress).toBe(address.toLowerCase());
  });

  it("returns a generic error when storage fails", async () => {
    uploadMock.mockRejectedValue(
      new Error("PROFILE_IMAGE_GCP_BUCKET is missing")
    );
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await uploadProfileImage(
      attachment(makeImage(PNG_SIGNATURE), "image/png"),
      address,
      auth
    );

    expect(result).toEqual({
      success: false,
      error: "Failed to upload image. Please try again.",
    });
    consoleSpy.mockRestore();
  });
});
