class GeminiService {
  async generateThematicGlyphs(theme: string): Promise<string> {
    const response = await fetch('/api/glyphs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ theme }),
    });
    const body = (await response.json().catch(() => null)) as { glyphs?: string; error?: string } | null;

    if (!response.ok || !body?.glyphs) {
      throw new Error(body?.error || 'No se pudieron generar los glifos.');
    }

    return body.glyphs;
  }
}

export const geminiService = new GeminiService();
