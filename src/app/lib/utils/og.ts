import fs from "fs/promises";
import path from "path";

export async function loadFont(filename: string): Promise<ArrayBuffer> {
  const filePath = path.join(process.cwd(), "public", "fonts", filename);
  return fs.readFile(filePath);
}

export async function loadImage(filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), "public", "images", filename);
  const imageBuffer = await fs.readFile(filePath);
  const base64Image = Buffer.from(imageBuffer).toString("base64");
  const mimeType = "image/png"; // Adjust if your image is not a PNG
  return `data:${mimeType};base64,${base64Image}`;
}
