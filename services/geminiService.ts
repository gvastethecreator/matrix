
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    if (!this.ai) {
      this.ai = new GoogleGenAI({ apiKey });
    }

    return this.ai;
  }

  /**
   * Genera un conjunto de glifos temáticos utilizando Gemini 3 Flash.
   */
  async generateThematicGlyphs(theme: string): Promise<string> {
    try {
      const response = await this.getClient().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a single line string of 40-60 unique and visually interesting characters, symbols, or glyphs that represent the concept: "${theme}". Include unusual Unicode symbols. Return ONLY the raw characters without any explanation or formatting.`,
      });
      
      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      // Limpiar posibles espacios o saltos de línea del modelo
      return text.replace(/\s/g, '').trim();
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
