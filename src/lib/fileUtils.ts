export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:type/subtype;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface AttachmentData {
  fileName: string;
  contentType: string;
  fileSize: number;
  base64Data: string;
}

export async function convertFileToAttachmentData(
  file: File
): Promise<AttachmentData> {
  const base64Data = await fileToBase64(file);
  return {
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
    base64Data,
  };
}
