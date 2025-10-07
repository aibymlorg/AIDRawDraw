import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (file: File) => void;
}

// Icons for the camera controls
const CameraSnapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
const RetakeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
    </svg>
);
const FlipCameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

export const CameraModal: React.FC<CameraModalProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isFlipping, setIsFlipping] = useState(false);

  const cleanupCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }, [stream]);

  const startCamera = useCallback(async (preferredFacingMode: 'user' | 'environment') => {
    try {
      // Try with exact facingMode first
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: preferredFacingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
      } catch (exactError) {
        // Fallback: try without exact constraint
        console.log(`Exact ${preferredFacingMode} camera not available, trying ideal...`);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: preferredFacingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
      setIsFlipping(false);
    } catch (err) {
      console.error("Camera access error:", err);

      // If rear camera fails, try front camera as fallback
      if (preferredFacingMode === 'environment') {
        console.log("Rear camera failed, trying front camera...");
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
          setFacingMode('user');
          setError(null);
          setIsFlipping(false);
          return;
        } catch (fallbackErr) {
          console.error("Front camera also failed:", fallbackErr);
        }
      }

      setError("Could not access the camera. Please ensure you have given permission and are using HTTPS.");
      setIsFlipping(false);
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      cleanupCamera();
    };
  }, []);

  const handleSnap = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        cleanupCamera(); // Turn off camera after snapping to show preview
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleFlipCamera = async () => {
    if (isFlipping || capturedImage) return;

    setIsFlipping(true);
    cleanupCamera();

    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    await startCamera(newFacingMode);
  };

  const handleUsePhoto = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
        }
      }, 'image/jpeg', 0.95);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative bg-gray-900 rounded-lg w-full max-w-lg aspect-[9/16] overflow-hidden flex flex-col">
        <button onClick={onClose} className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 z-20" aria-label="Close camera">
          &times;
        </button>

        {error ? (
          <div className="flex-grow flex flex-col items-center justify-center text-white p-4">
            <p className="text-red-500 font-bold text-lg mb-2">Camera Error</p>
            <p className="text-center">{error}</p>
            <button onClick={onClose} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg">Close</button>
          </div>
        ) : (
          <>
            <div className="relative flex-grow bg-black flex items-center justify-center">
              {capturedImage ? (
                <img src={capturedImage} alt="Captured" className="object-contain h-full w-full" />
              ) : (
                <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-t from-black via-black/70 to-transparent">
              {capturedImage ? (
                <>
                  <div className="w-12"></div>
                  <div className="flex items-center gap-8">
                    <button onClick={handleRetake} className="text-white bg-gray-600 rounded-full p-4 hover:bg-gray-700 transition-colors" title="Retake Photo">
                      <RetakeIcon />
                    </button>
                    <button onClick={handleUsePhoto} className="text-white bg-green-500 rounded-full p-4 hover:bg-green-600 transition-colors" title="Use This Photo">
                      <CheckIcon />
                    </button>
                  </div>
                  <div className="w-12"></div>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFlipCamera}
                    disabled={isFlipping}
                    className="text-white bg-gray-700 bg-opacity-60 rounded-full p-3 hover:bg-opacity-80 transition-colors disabled:opacity-50"
                    title="Flip Camera"
                  >
                    <FlipCameraIcon />
                  </button>
                  <button onClick={handleSnap} className="text-white bg-blue-500 rounded-full p-4 border-4 border-white/50 hover:bg-blue-600 transition-colors" title="Snap Photo">
                    <CameraSnapIcon />
                  </button>
                  <div className="w-12"></div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
