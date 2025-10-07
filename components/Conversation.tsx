import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '../types';
import { Spinner } from './Spinner';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ConversationProps {
  chatHistory: ChatMessage[];
  currentPrompt: string;
  setCurrentPrompt: React.Dispatch<React.SetStateAction<string>>;
  onSendMessage: () => void;
  onClear: () => void;
  isLoading: boolean;
  isConversationStarted: boolean;
}

const UserIcon: React.FC<{ label: string }> = ({ label }) => (
  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{label}</div>
);

const ModelIcon = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">🎨</div>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
    </svg>
);

const MicrophoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 10.1A5.001 5.001 0 0017 9V4a5 5 0 00-10 0v5a5.001 5.001 0 005 5.1zM3 9a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm13 0a1 1 0 100 2h1a1 1 0 100-2h-1z" clipRule="evenodd" />
  </svg>
);


export const Conversation: React.FC<ConversationProps> = ({ chatHistory, currentPrompt, setCurrentPrompt, onSendMessage, onClear, isLoading, isConversationStarted }) => {
  const { t } = useTranslation();
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const defaultQuestion = t('conversation.defaultQuestion');

  // Set default question when conversation hasn't started and prompt is empty
  React.useEffect(() => {
    if (!isConversationStarted && !currentPrompt) {
      setCurrentPrompt(defaultQuestion);
    }
  }, [isConversationStarted, currentPrompt, setCurrentPrompt]);

  const handleSpeechResult = (transcript: string) => {
    setCurrentPrompt(prev => prev ? `${prev} ${transcript}`.trim() : transcript);
  };

  const { isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition({ onResult: handleSpeechResult });


  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        onSendMessage();
      }
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-green-300/50 flex flex-col h-[85vh] md:h-auto">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">{t('conversation.title')}</h3>
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4 mb-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <ModelIcon />}
            <div className={`max-w-xs md:max-w-sm lg:max-w-md p-3 rounded-2xl backdrop-blur-sm ${msg.role === 'user' ? 'bg-green-600 text-white rounded-br-none shadow-lg' : 'bg-white/80 text-gray-800 rounded-bl-none border border-green-200 shadow-md'}`}>
              <p className="whitespace-pre-wrap">{msg.parts.map(p => p.text).join('')}</p>
            </div>
            {msg.role === 'user' && <UserIcon label={t('conversation.you')} />}
          </div>
        ))}
         {!isConversationStarted && (
             <div className="text-center text-gray-600 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-green-200">
                <p>🖼️ {t('conversation.startPrompt')}</p>
                <p className="text-sm mt-2">{t('conversation.example')}</p>
             </div>
         )}
      </div>
      <div className="mt-auto pt-2 border-t">
        <div className="relative">
          <textarea
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConversationStarted ? t('conversation.followUpPlaceholder') : t('conversation.placeholder')}
            className="w-full p-3 pr-28 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            rows={2}
            disabled={isLoading}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {hasRecognitionSupport && (
                <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isLoading}
                    className={`p-2 rounded-full text-white transition-all transform hover:scale-110 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500 hover:bg-gray-600'}`}
                    title={isListening ? t('conversation.stopListening') : t('conversation.speak')}
                >
                    <MicrophoneIcon />
                </button>
            )}
            <button
              onClick={onSendMessage}
              disabled={isLoading || !currentPrompt.trim()}
              className="p-2 rounded-full bg-green-600 text-white disabled:bg-gray-300 hover:bg-green-700 transition-all transform hover:scale-110 shadow-lg"
              title={t('conversation.send')}
            >
              {isLoading ? <Spinner /> : <SendIcon />}
            </button>
             <button
              onClick={onClear}
              disabled={isLoading}
              className="p-2 rounded-full bg-emerald-600 text-white disabled:bg-gray-300 hover:bg-emerald-700 transition-all transform hover:scale-110 shadow-lg"
              title={t('conversation.clear')}
            >
                <ClearIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};