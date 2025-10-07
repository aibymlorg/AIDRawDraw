
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ImageFile {
  file: File;
  previewUrl: string;
}

export interface UnifiedChatInterface {
  sendMessageStream(params: { message: any[] }): AsyncIterable<{ text: string }>;
}
