
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Always use process.env.API_KEY directly in the constructor as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to check if API key is present
export const isAiAvailable = (): boolean => {
  return !!process.env.API_KEY;
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const chatWithAI = async (message: string, history: ChatMessage[]): Promise<string> => {
  if (!isAiAvailable()) return "I'm sorry, my brain (API Key) is currently offline. Please try again later.";

  try {
    // Convert history to format expected by API if needed, or just append to prompt for stateless 
    // simple implementation. For better context, we use the `chat` method.
    
    // Create a simple history string for context (simplification for this demo)
    const context = `You are "TarvizBot", the helpful AI assistant for Tarviz Digimart, a digital marketing agency in Chennai.
    Services: Social Media, SEO, Web Design, Graphic Design, E-commerce Management.
    Tone: Professional, friendly, and persuasive.
    Goal: Help users find services or get a quote.
    Address: Chennai, Tamil Nadu.
    Phone: +91 74 7006 7003.
    Email: info@tarvizdigimart.com.
    
    User Query: ${message}`;

    // Fix: Updated to gemini-3-flash-preview for basic text tasks.
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
  if (!isAiAvailable()) return null;

  try {
    // Fix: Updated to gemini-3-flash-preview.
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
    if (!isAiAvailable()) return "AI Service Unavailable. Please configure API_KEY.";
    
    try {
        // Fix: Updated to gemini-3-flash-preview.
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
  if (!isAiAvailable()) return null;

  try {
    // Fix: Updated to gemini-3-flash-preview.
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
