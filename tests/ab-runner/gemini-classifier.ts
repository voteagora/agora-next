import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

// Add specific typings or leave any for now
export async function classifyDriftsWithGemini(
  drifts: any[],
  artifactsDir: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No GEMINI_API_KEY found, skipping AI classification.");
    return drifts;
  }

  const ai = new GoogleGenAI({ apiKey });
  console.log(`🧠 Initializing Gemini AI analysis for ${drifts.length} drifts...`);

  // We should process drifts in batches to avoid rate limits, or concurrently if few
  const batchSize = 3;
  for (let i = 0; i < drifts.length; i += batchSize) {
    const batch = drifts.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (drift, index) => {
        try {
          const imgAPath = path.join(artifactsDir, "focused-crops", "clean", drift.imgUrlA);
          const imgBPath = path.join(artifactsDir, "focused-crops", "clean", drift.imgUrlB);

          // Some components might be missing on one side, so check if files exist
          if (!fs.existsSync(imgAPath) || !fs.existsSync(imgBPath)) {
            drift.aiVerdict = "Skipped - Missing Image";
            drift.aiReason = "One of the comparison images is missing.";
            return;
          }

          const imgABase64 = fs.readFileSync(imgAPath).toString("base64");
          const imgBBase64 = fs.readFileSync(imgBPath).toString("base64");

          const prompt = `You are an expert QA visual regression engineer. 
I am comparing a baseline UI (Image 1, URL A) against a new UI (Image 2, URL B).
The visual regression engine flagged a difference here. 

Analyze the images and determine if this drift is:
1. "Real Bug" - An unintentional regression (e.g. text cutoff, wrong colors, broken layout, missing critical data).
2. "Acceptable Change" - An intentional redesign, new feature, or acceptable data update.
3. "Noise" - Micro-shifts, 1px rendering differences, invisible padding changes, or loading states.

Reply strictly in JSON format:
{
  "verdict": "Real Bug" | "Acceptable Change" | "Noise",
  "reason": "Short explanation of your reasoning (max 2 sentences)."
}`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
              {
                role: 'user',
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType: "image/png", data: imgABase64 } },
                  { inlineData: { mimeType: "image/png", data: imgBBase64 } }
                ]
              }
            ],
            config: {
              responseMimeType: "application/json",
            }
          });

          if (response.text) {
             const result = JSON.parse(response.text);
             drift.aiVerdict = result.verdict;
             drift.aiReason = result.reason;
          }
        } catch (err) {
          console.error(`AI Classification failed for drift ${drift.id}:`, err);
          drift.aiVerdict = "AI Error";
          drift.aiReason = String(err);
        }
      })
    );
  }

  return drifts;
}
