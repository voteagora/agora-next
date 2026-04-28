import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

// Add specific typings or leave any for now
export async function classifyDriftsWithGemini(
  drifts: any[],
  artifactsDir: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  const enableAI = process.env.ENABLE_AI_MASKING !== "false";

  if (!apiKey || !enableAI) {
    console.log(
      "AI classification is disabled or no GEMINI_API_KEY found, skipping."
    );
    return drifts;
  }

  const ai = new GoogleGenAI({ apiKey });
  console.log(
    `🧠 Initializing Gemini AI analysis for ${drifts.length} drifts...`
  );

  // We should process drifts in batches to avoid rate limits, or concurrently if few
  const batchSize = 3;
  for (let i = 0; i < drifts.length; i += batchSize) {
    const batch = drifts.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (drift, index) => {
        try {
          if (!drift.imgUrlA || !drift.imgUrlB) {
            drift.aiVerdict = "Skipped - Missing Image";
            drift.aiReason =
              "Drift exceeded crop limits or image URLs missing.";
            return;
          }

          const imgAPath = path.join(
            artifactsDir,
            "focused-crops",
            "clean",
            drift.imgUrlA
          );
          const imgBPath = path.join(
            artifactsDir,
            "focused-crops",
            "clean",
            drift.imgUrlB
          );

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

          let attempt = 0;
          let success = false;
          while (attempt < 3 && !success) {
            try {
              const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                  {
                    role: "user",
                    parts: [
                      { text: prompt },
                      {
                        inlineData: { mimeType: "image/png", data: imgABase64 },
                      },
                      {
                        inlineData: { mimeType: "image/png", data: imgBBase64 },
                      },
                    ],
                  },
                ],
                config: {
                  responseMimeType: "application/json",
                },
              });

              if (response.text) {
                const result = JSON.parse(response.text);
                drift.aiVerdict = result.verdict;
                drift.aiReason = result.reason;
              }
              success = true;
            } catch (retryErr: any) {
              attempt++;
              // Don't retry on 400 (Bad Request), but retry on 429/500/503
              if (attempt >= 3 || retryErr?.status === 400) {
                throw retryErr;
              }
              console.warn(
                `[AI] Rate limit or transient error. Retrying drift ${drift.component || "unknown"} in ${attempt * 2}s...`
              );
              await new Promise((res) => setTimeout(res, attempt * 2000));
            }
          }
        } catch (err) {
          console.error(
            `AI Classification failed for drift ${drift.component || index}:`,
            err
          );
          drift.aiVerdict = "AI Error";
          drift.aiReason = String(err);
        }
      })
    );
    // Add a small delay between batches to respect rate limits
    if (i + batchSize < drifts.length) {
      await new Promise((res) => setTimeout(res, 1500));
    }
  }

  return drifts;
}
