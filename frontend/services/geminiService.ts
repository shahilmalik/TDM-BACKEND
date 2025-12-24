import { GoogleGenAI, Type } from "@google/genai";

// Vite only exposes env vars prefixed with `VITE_`.
const getGeminiKey = (): string => {
  try {
    return String((import.meta as any)?.env?.VITE_GEMINI_API_KEY || "").trim();
  } catch {
    return "";
  }
};

// Lazily create the client so the app doesn't crash if the key is missing.
const getAiClient = (): GoogleGenAI | null => {
  const key = getGeminiKey();
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
};

// Helper to check if API key is present
export const isAiAvailable = (): boolean => {
  return !!getGeminiKey();
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const chatWithAI = async (message: string, history: ChatMessage[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI is currently unavailable.";

  try {
    const context = `You are "TarvizBot", the helpful AI assistant for Tarviz Digimart, a digital marketing agency in Chennai.
    Services: Social Media, SEO, Web Design, Graphic Design, E-commerce Management.
    Tone: Professional, friendly, and persuasive.
    Goal: Help users find services or get a quote.
    Address: Chennai, Tamil Nadu.
    Phone: +91 74 7006 7003.
    Email: info@tarvizdigimart.com.
    
    User Query: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: context,
    });

    return response.text || "I didn't catch that. Could you rephrase?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to the server right now.";
  }
};

export interface SEOSuggestion {
  title: string;
  metaDescription: string;
  keywords: string[];
}

export interface SEOAuditResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export const generateSEOForBlog = async (topic: string, contentSnippet: string): Promise<SEOSuggestion | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate SEO metadata for a blog post about "${topic}". 
      Here is a snippet of the content: "${contentSnippet}".
      Return a title, a meta description (max 160 chars), and a list of 5 SEO keywords.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            keywords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "metaDescription", "keywords"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as SEOSuggestion;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const generateBlogOutline = async (topic: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "AI Service Unavailable. Please configure API_KEY.";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Create a comprehensive blog post outline for the topic: "${topic}". 
            Target audience: Small business owners looking for digital marketing advice.
            Format: Markdown.`
        });
        return response.text || "Failed to generate content.";
    } catch (e) {
        console.error(e);
        return "Error generating outline.";
    }
}

export const analyzeSiteSEO = async (url: string): Promise<SEOAuditResult | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the potential SEO status for the website: ${url}. 
      Since you cannot access the live web, simulate a realistic audit based on the domain name industry and common web pitfalls for this type of business.
      Return a JSON with:
      - score (integer 0-100)
      - summary (string, 2 sentences)
      - strengths (array of 3 strings)
      - weaknesses (array of 3 strings)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "summary", "strengths", "weaknesses"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as SEOAuditResult;
  } catch (e) {
    console.error(e);
    return null;
  }
}
