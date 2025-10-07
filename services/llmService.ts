import { createChat as createGeminiChat } from './geminiService';
import { createChat as createOllamaChat } from './ollamaService';
import type { UnifiedChatInterface } from '../types';

type LLMProvider = 'gemini' | 'ollama';

const LLM_PROVIDER = (process.env.REACT_APP_LLM_PROVIDER as LLMProvider) || 'gemini';

/**
 * Creates a new chat session with the configured LLM provider.
 */
export const createChat = (): UnifiedChatInterface => {
  console.log(`Using LLM provider: ${LLM_PROVIDER}`);

  switch (LLM_PROVIDER) {
    case 'ollama':
      return createOllamaChat();
    case 'gemini':
    default:
      return createGeminiChat();
  }
};