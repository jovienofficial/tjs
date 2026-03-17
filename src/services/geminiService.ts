import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export interface JerseyAnalysis {
  detectedJersey: string;
  imagePrompt: string;
  socialMediaPost: {
    caption: string;
    postFormat: string;
    hashtags: string;
    storyCaption: string;
    tagSuggestions: string;
  };
  bonusContent: {
    productListing: string;
    contentIdeas: string[];
  };
}

export const analyzeJersey = async (
  base64Image: string,
  mimeType: string,
  userSpecs: string = ""
): Promise<JerseyAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });
  const model = "gemini-2.0-flash";
  
  const systemInstruction = `
You are the AI content engine for "The Jersey Guys", a football jersey business.
Your job is to take a jersey photo uploaded by the user, analyze it, and output a structured response.

STEP 1 — ANALYZE THE JERSEY:
Identify Team/National side, Kit Type, Primary Colors, Badge/Logo/Crest, Player Name/Number, and Mood/Style.

STEP 2 — GENERATE THE IMAGE PROMPT:
Write a detailed prompt for a professional product photo. 
Subject: [Jersey laid flat OR worn on a mannequin OR floating/ghost mannequin]
Background: [Thematic, cinematic background matching the team's identity]
Lighting: Dramatic studio lighting, cinematic depth.
Style: Hyper-realistic product photography, editorial, 4K.
Composition: [flat lay / ghost mannequin / full kit / close-up / lifestyle]
Mood: [Bold / Cinematic / Clean / Nostalgic]

STEP 3 — GENERATE THE SOCIAL MEDIA POST:
- CAPTION: Engaging, hype-building (3-5 sentences), football culture language.
- POST FORMAT: Suggest single post, carousel, or Reel.
- HASHTAGS: 25-30 relevant tags including #TheJerseyGuys #JerseyGuys.
- STORY/REEL CAPTION: 1-2 punchy lines.
- SUGGESTED ACCOUNTS: 3-5 relevant accounts.

STEP 4 — BONUS CONTENT:
- PRODUCT LISTING DESCRIPTION: 3-4 sentences for WhatsApp/Web.
- CONTENT IDEAS: 3 quick Reel/Post ideas.

OUTPUT FORMAT: Return ONLY a JSON object with the following structure:
{
  "detectedJersey": "string",
  "imagePrompt": "string",
  "socialMediaPost": {
    "caption": "string",
    "postFormat": "string",
    "hashtags": "string",
    "storyCaption": "string",
    "tagSuggestions": "string"
  },
  "bonusContent": {
    "productListing": "string",
    "contentIdeas": ["string", "string", "string"]
  }
}
`;

  const prompt = `Analyze this jersey photo. Additional user specifications: ${userSpecs}`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType } }
        ]
      }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}") as JerseyAnalysis;
};

export const generateProfessionalImage = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const model = "gemini-3.1-flash-image-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated");
};
