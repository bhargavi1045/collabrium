
import { generateWithOpenAI } from "./openaiService";
import { generateWithGemini } from "./geminiService";

export async function generateAIResponse(prompt: string): Promise<string> {

  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await generateWithGemini(prompt);
      console.log("[AI] Response generated using Gemini");
      return res;
    } catch (err) {
      console.warn("[AI] Gemini failed, falling back...");
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await generateWithOpenAI(prompt);
      console.log("[AI] Response generated using OpenAI");
      return res;
    } catch (err) {
      console.warn("[AI] OpenAI failed, falling back...");
    }
  }

  throw new Error("No AI providers available or all providers failed");
}
