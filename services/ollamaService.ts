import type { UnifiedChatInterface } from '../types';

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

interface OllamaMessage {
  role: string;
  content: string;
  images?: string[];
}

export class OllamaChat implements UnifiedChatInterface {
  private baseUrl: string;
  private model: string;
  private messages: OllamaMessage[] = [];

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async *sendMessageStream({ message }: { message: any[] }): AsyncIterable<{ text: string }> {
    try {
      // Convert Gemini format to Ollama format
      const ollamaMessage: OllamaMessage = {
        role: 'user',
        content: '',
        images: []
      };

      for (const part of message) {
        if (typeof part === 'string') {
          ollamaMessage.content += part;
        } else if (part.inlineData) {
          // Convert base64 image data for Ollama
          ollamaMessage.images?.push(part.inlineData.data);
        }
      }

      this.messages.push(ollamaMessage);

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: this.messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response stream');
      }

      let assistantMessage = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const data: OllamaResponse = JSON.parse(line);
              if (data.message?.content) {
                assistantMessage += data.message.content;
                yield { text: data.message.content };
              }
            } catch (e) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Add assistant response to message history
      this.messages.push({
        role: 'assistant',
        content: assistantMessage
      });

    } catch (error) {
      console.error('Ollama API error:', error);
      throw error;
    }
  }
}

const OLLAMA_URL = process.env.REACT_APP_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.REACT_APP_OLLAMA_MODEL || 'llava:latest';

if (!OLLAMA_URL) {
  throw new Error("REACT_APP_OLLAMA_URL environment variable not set. Please ensure you have a .env file with REACT_APP_OLLAMA_URL='your_ollama_url' or have set it in your environment.");
}

if (!OLLAMA_MODEL) {
  throw new Error("REACT_APP_OLLAMA_MODEL environment variable not set. Please ensure you have a .env file with REACT_APP_OLLAMA_MODEL='your_model' or have set it in your environment.");
}

/**
 * Creates a new chat session with the Ollama model.
 */
export const createChat = (): UnifiedChatInterface => {
  return new OllamaChat(OLLAMA_URL, OLLAMA_MODEL);
};