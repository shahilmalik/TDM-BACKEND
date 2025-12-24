// Disable Gemini everywhere.
// IMPORTANT: Do not import @google/genai in the frontend bundle.

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

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

export const isAiAvailable = (): boolean => false;

export const chatWithAI = async (
  _message: string,
  _history: ChatMessage[]
): Promise<string> => {
  return "AI is disabled.";
};

export const generateSEOForBlog = async (
  _topic: string,
  _contentSnippet: string
): Promise<SEOSuggestion | null> => null;

export const generateBlogOutline = async (_topic: string): Promise<string> => {
  return "AI is disabled.";
};

export const analyzeSiteSEO = async (_url: string): Promise<SEOAuditResult | null> => null;
