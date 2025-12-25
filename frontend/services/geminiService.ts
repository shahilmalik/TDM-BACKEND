// Gemini/AI is fully disabled. No exports.

export type SEOAuditResult = {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
};

export const analyzeSiteSEO = async (_url: string): Promise<SEOAuditResult | null> => {
  return null;
};
