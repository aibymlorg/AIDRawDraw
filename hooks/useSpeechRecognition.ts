import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Polyfill for browser compatibility
// FIX: Cast `window` to `any` to access non-standard browser APIs without TypeScript errors.
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
}

export const useSpeechRecognition = ({ onResult }: UseSpeechRecognitionProps) => {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  // FIX: The `SpeechRecognition` type is not available in standard TypeScript DOM libraries.
  // Using `any` for the ref type is a pragmatic way to resolve the type error where a value
  // was being used as a type.
  const recognitionRef = useRef<any | null>(null);

  // Check for browser support
  const hasRecognitionSupport = !!SpeechRecognition;

  useEffect(() => {
    if (!hasRecognitionSupport) {
      console.log("Speech recognition not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false; // We only care about the final result

    // Set language based on current UI language
    recognition.lang = i18n.language === 'zh-TW' ? 'zh-TW' : 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup function
    return () => {
      recognition.stop();
    };
  }, [hasRecognitionSupport, onResult, i18n.language]);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch(e) {
        console.error("Could not start speech recognition:", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {
        console.error("Could not stop speech recognition:", e);
      }
    }
  }, [isListening]);

  return {
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
  };
};