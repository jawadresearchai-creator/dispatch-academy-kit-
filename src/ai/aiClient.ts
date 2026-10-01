import { GoogleGenAI } from '@google/genai';
import { getSettings } from '../db';

export interface AIHealthStatus {
  available: boolean;
  transport: 'server' | 'direct' | 'none';
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const COURSE_GUARDRAILS = `You are part of Dispatch Academy, a training app for carrier-side U.S. truck dispatch.
Ground every factual statement in the COURSE CONTEXT provided. Cite page IDs like [m07-p08].
If the answer is not in the context, say so and suggest the official source to check.
Practice data (Blue Line Transport, Truck 12, brokers, loads) is fictional; market numbers are dated snapshots.
Always keep carrier-side ethics: no re-brokering, no broker payments to the dispatcher, no shared logins,
no misrepresentation, never pressure drivers beyond hours-of-service limits, take fraud red flags seriously.
Not legal or tax advice.`;

export async function checkAIHealth(): Promise<AIHealthStatus> {
  // 1. Try server health
  try {
    const res = await fetch('/api/ai/health');
    if (res.ok) {
      const data = await res.json();
      if (data.available) {
        return {
          available: true,
          transport: 'server',
          message: 'Server Gemini API active',
        };
      }
    }
  } catch {
    // Server route offline or desktop mode
  }

  // 2. Try direct key from settings
  try {
    const settings = await getSettings();
    if (settings.userApiKey && settings.userApiKey.trim().length > 5) {
      return {
        available: true,
        transport: 'direct',
        message: 'Personal Gemini API key active',
      };
    }
  } catch {
    // Settings read error
  }

  return {
    available: false,
    transport: 'none',
    message: 'AI offline (configure in Settings or add server key)',
  };
}

export async function generateContentAI(params: {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  jsonMode?: boolean;
  responseSchema?: any;
}): Promise<string> {
  const settings = await getSettings();
  const selectedModel = params.model || settings.aiModel || 'gemini-2.5-flash';

  // 1. Try server transport first
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: params.prompt,
        systemInstruction: params.systemInstruction || COURSE_GUARDRAILS,
        model: selectedModel,
        jsonMode: params.jsonMode,
        responseSchema: params.responseSchema,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.text || '';
    }
  } catch {
    // Fall back to direct transport
  }

  // 2. Direct transport with user API key
  if (settings.userApiKey) {
    const ai = new GoogleGenAI({ apiKey: settings.userApiKey });
    const config: any = {};
    if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
    if (params.jsonMode) {
      config.responseMimeType = 'application/json';
      if (params.responseSchema) config.responseSchema = params.responseSchema;
    }
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: params.prompt,
      config,
    });
    return response.text || '';
  }

  throw new Error('AI service is not available. Please configure an API key in Settings.');
}

export async function chatAI(params: {
  messages: ChatMessage[];
  systemInstruction?: string;
  model?: string;
}): Promise<string> {
  const settings = await getSettings();
  const selectedModel = params.model || settings.aiModel || 'gemini-2.5-flash';

  // Server transport
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: params.messages,
        systemInstruction: params.systemInstruction || COURSE_GUARDRAILS,
        model: selectedModel,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.text || '';
    }
  } catch {
    // Fall back to direct
  }

  // Direct transport
  if (settings.userApiKey) {
    const ai = new GoogleGenAI({ apiKey: settings.userApiKey });
    const contents = params.messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));
    const config: any = {};
    if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config,
    });
    return response.text || '';
  }

  throw new Error('AI chat unavailable. Check Settings to enable.');
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const buffer = await audioBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  try {
    const res = await fetch('/api/ai/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: base64,
        mimeType: audioBlob.type || 'audio/webm',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.text || '';
    }
  } catch {
    // Server failed
  }

  const settings = await getSettings();
  if (settings.userApiKey) {
    const ai = new GoogleGenAI({ apiKey: settings.userApiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: audioBlob.type || 'audio/webm',
                data: base64,
              },
            },
            {
              text: 'Transcribe the spoken audio verbatim in English. Keep numbers as digits; keep U.S. place names. Return plain text.',
            },
          ],
        },
      ],
    });
    return response.text?.trim() || '';
  }

  throw new Error('Speech transcription requires AI connection.');
}
