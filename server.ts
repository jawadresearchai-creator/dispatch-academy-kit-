import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '20mb' }));

  // AI Health Check
  app.get('/api/ai/health', (req, res) => {
    const hasKey = !!process.env.GEMINI_API_KEY;
    res.json({
      status: 'ok',
      hasServerKey: hasKey,
      available: hasKey,
      timestamp: new Date().toISOString(),
    });
  });

  // AI Content Generation
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'Server GEMINI_API_KEY is not configured.' });
      }

      const { prompt, systemInstruction, model = 'gemini-2.5-flash', jsonMode, responseSchema } = req.body;
      const ai = new GoogleGenAI({ apiKey });
      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (jsonMode) {
        config.responseMimeType = 'application/json';
        if (responseSchema) config.responseSchema = responseSchema;
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error('AI generate error:', err);
      res.status(500).json({ error: err.message || 'AI generation failed' });
    }
  });

  // AI Multi-turn Chat
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'Server GEMINI_API_KEY is not configured.' });
      }

      const { messages, systemInstruction, model = 'gemini-2.5-flash' } = req.body;
      const ai = new GoogleGenAI({ apiKey });
      const contents = (messages || []).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content || m.text || '' }],
      }));

      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;

      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error('AI chat error:', err);
      res.status(500).json({ error: err.message || 'AI chat failed' });
    }
  });

  // AI Audio Transcription
  app.post('/api/ai/transcribe', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'Server GEMINI_API_KEY is not configured.' });
      }

      const { audioBase64, mimeType = 'audio/webm' } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: 'audioBase64 is required' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: audioBase64,
                },
              },
              {
                text: 'Transcribe the spoken audio verbatim in English. Keep numbers as digits; keep U.S. place names. Return ONLY the transcribed text without extra commentary or quotes.',
              },
            ],
          },
        ],
      });

      res.json({ text: response.text?.trim() || '' });
    } catch (err: any) {
      console.error('AI transcribe error:', err);
      res.status(500).json({ error: err.message || 'Audio transcription failed' });
    }
  });

  // In production, serve dist; in dev, mount Vite middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dispatch Academy dev server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
