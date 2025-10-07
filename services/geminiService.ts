import { GoogleGenAI, type Chat } from "@google/genai";
import type { UnifiedChatInterface } from '../types';
import { requestQueue } from './requestQueue';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  // Provide a more user-friendly error for the developer.
  throw new Error("REACT_APP_GEMINI_API_KEY environment variable not set. Please ensure you have a .env file with REACT_APP_GEMINI_API_KEY='your_key' or have set it in your environment.");
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

class GeminiChatWrapper implements UnifiedChatInterface {
  private geminiChat: Chat;

  constructor(geminiChat: Chat) {
    this.geminiChat = geminiChat;
  }

  async *sendMessageStream(params: { message: any[] }): AsyncIterable<{ text: string }> {
    // Use request queue for chat messages (high priority for user interactions)
    const streamGenerator = await requestQueue.enqueue(async () => {
      try {
        return await this.geminiChat.sendMessageStream({ message: params.message });
      } catch (error) {
        console.error('Gemini stream error:', error);
        // Provide more detailed error information
        throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }, 'high'); // High priority for chat messages

    // Yield chunks from the stream
    for await (const chunk of streamGenerator) {
      yield { text: chunk.text };
    }
  }
}

/**
 * Creates a new chat session with the Gemini model.
 * Using gemini-2.0-flash which has better support for multimodal inputs (text + images)
 */
export const createChat = (): UnifiedChatInterface => {
  const geminiChat = genAI.chats.create({
    model: "gemini-2.0-flash-exp",
    config: {
      // Enable safety settings to avoid blocking issues
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    }
  });
  return new GeminiChatWrapper(geminiChat);
};