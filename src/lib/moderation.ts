import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export interface ModerationResult {
  flagged: boolean;
  categories: {
    sexual: boolean;
    "sexual/minors": boolean;
    harassment: boolean;
    "harassment/threatening": boolean;
    hate: boolean;
    "hate/threatening": boolean;
    illicit: boolean;
    "illicit/violent": boolean;
    "self-harm": boolean;
    "self-harm/intent": boolean;
    "self-harm/instructions": boolean;
    violence: boolean;
    "violence/graphic": boolean;
  };
  category_scores: {
    sexual: number;
    "sexual/minors": number;
    harassment: number;
    "harassment/threatening": number;
    hate: number;
    "hate/threatening": number;
    illicit: number;
    "illicit/violent": number;
    "self-harm": number;
    "self-harm/intent": number;
    "self-harm/instructions": number;
    violence: number;
    "violence/graphic": number;
  };
}

export async function moderateTextContent(
  text: string
): Promise<ModerationResult> {
  try {
    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    return response.results[0] as ModerationResult;
  } catch (error) {
    console.error("Error moderating text content:", error);
    // Return a safe default in case of API error
    return {
      flagged: false,
      categories: {
        sexual: false,
        "sexual/minors": false,
        harassment: false,
        "harassment/threatening": false,
        hate: false,
        "hate/threatening": false,
        illicit: false,
        "illicit/violent": false,
        "self-harm": false,
        "self-harm/intent": false,
        "self-harm/instructions": false,
        violence: false,
        "violence/graphic": false,
      },
      category_scores: {
        sexual: 0,
        "sexual/minors": 0,
        harassment: 0,
        "harassment/threatening": 0,
        hate: 0,
        "hate/threatening": 0,
        illicit: 0,
        "illicit/violent": 0,
        "self-harm": 0,
        "self-harm/intent": 0,
        "self-harm/instructions": 0,
        violence: 0,
        "violence/graphic": 0,
      },
    };
  }
}

export function isContentNSFW(
  moderation: ModerationResult,
  threshold: number = 0.5
): boolean {
  // Check if any explicit NSFW categories are flagged
  const nsfwCategories = [
    "sexual",
    "sexual/minors",
    "violence/graphic",
    "self-harm",
    "self-harm/intent",
    "self-harm/instructions",
  ];

  // If OpenAI flagged it, it's NSFW
  if (moderation.flagged) {
    return true;
  }

  // Check specific NSFW categories with threshold
  return nsfwCategories.some(
    (category) =>
      moderation.category_scores[
        category as keyof typeof moderation.category_scores
      ] > threshold
  );
}
