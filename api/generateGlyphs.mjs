import { GoogleGenAI } from '@google/genai';

const MAX_BODY_BYTES = 2_048;
const MAX_THEME_LENGTH = 120;

const json = (response, status, body) => {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(body));
};

const readJson = async (request) => {
  const chunks = [];
  let length = 0;

  for await (const chunk of request) {
    length += chunk.length;
    if (length > MAX_BODY_BYTES) {
      throw new Error('PAYLOAD_TOO_LARGE');
    }
    chunks.push(Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const generateThematicGlyphs = async (theme, apiKey) => {
  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate one line with 40-60 unique glyphs that represent "${theme}". Include unusual Unicode symbols. Return only the glyphs, with no markdown or explanation.`,
  });
  const glyphs = response.text?.replace(/\s/gu, '').trim();

  if (!glyphs) {
    throw new Error('EMPTY_MODEL_RESPONSE');
  }

  return glyphs;
};

export const createGlyphsHandler =
  ({ apiKey = process.env.GEMINI_API_KEY, generate = generateThematicGlyphs } = {}) =>
  async (request, response) => {
    if (request.method !== 'POST') {
      response.setHeader('allow', 'POST');
      json(response, 405, { error: 'Método no permitido.' });
      return;
    }

    if (!apiKey) {
      json(response, 503, { error: 'Gemini no está configurado en el servidor.' });
      return;
    }

    try {
      const body = await readJson(request);
      const theme = typeof body.theme === 'string' ? body.theme.trim() : '';

      if (!theme || theme.length > MAX_THEME_LENGTH) {
        json(response, 400, { error: 'El tema debe tener entre 1 y 120 caracteres.' });
        return;
      }

      json(response, 200, { glyphs: await generate(theme, apiKey) });
    } catch (error) {
      if (error instanceof SyntaxError) {
        json(response, 400, { error: 'El cuerpo debe ser JSON válido.' });
        return;
      }
      if (error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE') {
        json(response, 413, { error: 'La solicitud es demasiado grande.' });
        return;
      }

      console.error('Gemini glyph generation failed.', error);
      json(response, 502, { error: 'Gemini no pudo generar los glifos.' });
    }
  };
