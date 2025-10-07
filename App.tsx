import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { DrawingCanvas } from './components/DrawingCanvas';
import { Conversation } from './components/Conversation';
import { ExampleImages } from './components/ExampleImages';
import { CameraModal } from './components/CameraModal';
import { QueueStatusIndicator } from './components/QueueStatusIndicator';
import { createChat } from './services/llmService';
import { fileToGenerativePart } from './utils/fileUtils';
import type { ChatMessage, ImageFile, UnifiedChatInterface } from './types';
import { DEFAULT_PROMPT, EXAMPLE_IMAGES } from './constants';

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [chat, setChat] = useState<UnifiedChatInterface | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState<boolean>(true);
  const [inputMode, setInputMode] = useState<'upload' | 'draw'>('draw');

  useEffect(() => {
    setChat(createChat());
    handleImageSelect(EXAMPLE_IMAGES[0].url);
    // eslint-disable--next-line react-hooks/exhaustive-deps
  }, []);

  const resetChat = useCallback(() => {
    setChat(createChat());
    setChatHistory([]);
    setCurrentPrompt('');
    setError(null);
    setIsLoading(false);
  }, []);

  const handleImageSelect = useCallback(async (image: File | string) => {
    resetChat();
    if (typeof image === 'string') {
      try {
        const response = await fetch(image);
        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }
        const blob = await response.blob();
        const fileName = image.split('/').pop() || 'example.png';
        const file = new File([blob], fileName, { type: blob.type });
        setSelectedImage({ file, previewUrl: image });
        setError(null);
      } catch (e) {
        console.error("Failed to load example image:", e);
        setError('Could not load the example image. Please check your network connection and try again.');
        setSelectedImage(null);
      }
    } else {
      if (!image.type.startsWith('image/')) {
        setError('Invalid file type. Please upload a valid image file (e.g., JPEG, PNG, GIF).');
        setSelectedImage(null);
        return;
      }
      setSelectedImage({
        file: image,
        previewUrl: URL.createObjectURL(image),
      });
      setError(null);
    }
  }, [resetChat]);

  const handleImageRemove = useCallback(() => {
    setSelectedImage(null);
    resetChat();
  }, [resetChat]);

  const handleSendMessage = async () => {
    if (!currentPrompt.trim() || !chat) {
      return;
    }

    if (!selectedImage && chatHistory.length === 0) {
      setError('Please upload an image before starting the conversation.');
      return;
    }
    
    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: currentPrompt }] };
    setChatHistory(prev => [...prev, userMessage]);
    setCurrentPrompt('');

    const isFirstMessage = chatHistory.length === 0;

    try {
      let promptPayload: (string | { inlineData: { mimeType: string; data: string } })[] = [currentPrompt];

      if (isFirstMessage && selectedImage) {
        const imagePart = await fileToGenerativePart(selectedImage.file);
        const defaultQuestion = t('conversation.defaultQuestion');
        const systemPrompt = t('systemPrompt');

        // For first message, use simple question without full Professor Panda prompt
        if (currentPrompt === defaultQuestion) {
          promptPayload = [imagePart, currentPrompt];
        } else {
          // For follow-up messages, use full Professor Panda prompt in selected language
          const fullPrompt = `${systemPrompt}\n\nHere is my question: "${currentPrompt}"`;
          promptPayload = [imagePart, fullPrompt];
        }
      } else if (!isFirstMessage && chatHistory.length === 2 && selectedImage) {
        // Second message (user's response to "Do you want to talk about the picture?")
        // If user responds positively, use Professor Panda prompt with standard art analysis
        const imagePart = await fileToGenerativePart(selectedImage.file);
        const systemPrompt = t('systemPrompt');
        const fullPrompt = `${systemPrompt}\n\nHere is my question: "What do you think of my drawing?"`;
        promptPayload = [imagePart, fullPrompt];
        // Keep the user's actual message in chat history, not the system prompt
      }
      
      const stream = await chat.sendMessageStream({ message: promptPayload });

      let assistantResponse = '';
      const assistantMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
      setChatHistory(prev => [...prev, assistantMessage]);

      for await (const chunk of stream) {
        assistantResponse += chunk.text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: assistantResponse }]};
          return newHistory;
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error('Chat error:', e);
      console.error('Error details:', errorMessage);

      // Enhanced error messages
      let displayError = 'Oops! Something went wrong while communicating with the AI model.';
      if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) { // Often a safety block or bad request
        displayError = 'The response was blocked. This can happen due to safety settings or invalid image format. Please try a different image or prompt.';
      } else if (errorMessage.includes('API_KEY') || errorMessage.includes('API key')) {
        displayError = 'The AI model is unavailable due to an invalid API key. Please check the application configuration.';
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        displayError = 'The AI model endpoint was not found. The model may not be available or the API configuration is incorrect.';
      } else if (navigator.onLine === false) {
         displayError = 'Network error. Please check your internet connection and try again.';
      } else {
        // Include the actual error message for debugging
        displayError = `AI communication error: ${errorMessage}`;
      }

      setError(displayError);
      setChatHistory(prev => prev.slice(0, -1)); // Remove the user message that failed
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    handleImageSelect(EXAMPLE_IMAGES[0].url);
  };
  
  const openCamera = () => setIsCameraOpen(true);
  const closeCamera = () => setIsCameraOpen(false);
  
  const handlePhotoCaptured = (photoFile: File) => {
    handleImageSelect(photoFile);
    closeCamera();
  };

  const handleDrawingComplete = useCallback((drawingFile: File) => {
    handleImageSelect(drawingFile);
  }, [handleImageSelect]);


  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url('/images/moss-background.jpg')`,
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto p-4 max-w-4xl font-sans backdrop-blur-sm bg-white/10">
      {isSummaryVisible && (
        <div className="bg-blue-100/90 backdrop-blur-sm border-l-4 border-blue-500 text-blue-800 p-4 rounded-lg relative my-4 shadow-lg" role="alert">
          <h4 className="font-bold">Welcome to KnowKidDraw!</h4>
          <p className="text-sm mt-1">
            Create and share art with Professor Panda, an AI art therapist with psychology training! Upload a photo, draw directly on the canvas with multiple tools and colors, or pick an example. Use the ✨ Enhance feature to transform your sketches into beautiful artwork with different styles like childhood magic, digital art, photorealistic, and more! Professor Panda provides warm, insightful feedback about your creativity, emotions, and artistic expression.
          </p>
          <button 
            onClick={() => setIsSummaryVisible(false)}
            className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
            aria-label="Dismiss summary"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <Header />
      
      {error && (
        <div className="bg-red-100/90 backdrop-blur-sm border border-red-400 text-red-700 px-4 py-3 rounded-lg relative my-4 shadow-lg" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex border-b border-green-300/50">
          <button
            onClick={() => setInputMode('draw')}
            className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors backdrop-blur-sm ${
              inputMode === 'draw'
                ? 'bg-green-600/90 text-white border-b-2 border-green-600 shadow-lg'
                : 'bg-white/70 text-gray-700 hover:text-gray-900 hover:bg-white/90'
            }`}
          >
            🎨 Draw Picture
          </button>
          <button
            onClick={() => setInputMode('upload')}
            className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors backdrop-blur-sm ${
              inputMode === 'upload'
                ? 'bg-green-600/90 text-white border-b-2 border-green-600 shadow-lg'
                : 'bg-white/70 text-gray-700 hover:text-gray-900 hover:bg-white/90'
            }`}
          >
            📤 Upload Photo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          {inputMode === 'draw' ? (
            <DrawingCanvas onDrawingComplete={handleDrawingComplete} />
          ) : (
            <>
              <ImageUploader
                selectedImagePreview={selectedImage?.previewUrl || null}
                onImageChange={handleImageSelect}
                onImageRemove={handleImageRemove}
                onOpenCamera={openCamera}
              />
              <ExampleImages onImageSelect={handleImageSelect} currentImageUrl={selectedImage?.previewUrl} />
            </>
          )}
        </div>
        <Conversation
          chatHistory={chatHistory}
          currentPrompt={currentPrompt}
          setCurrentPrompt={setCurrentPrompt}
          onSendMessage={handleSendMessage}
          onClear={handleClear}
          isLoading={isLoading}
          isConversationStarted={chatHistory.length > 0}
        />
      </div>
      
      {isCameraOpen && (
        <CameraModal
          onClose={closeCamera}
          onCapture={handlePhotoCaptured}
        />
      )}

      {/* Queue Status Indicator */}
      <QueueStatusIndicator />
      </div>
    </div>
  );
};

export default App;