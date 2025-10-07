import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { enhanceImage, ENHANCEMENT_STYLES, type EnhancementStyle } from '../services/imageEnhancementService';

interface DrawingCanvasProps {
  onDrawingComplete: (imageFile: File) => void;
  className?: string;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onDrawingComplete,
  className = ""
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [selectedStyle, setSelectedStyle] = useState<EnhancementStyle | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [isPressureSensitive, setIsPressureSensitive] = useState(false);
  const [isTabletConnected, setIsTabletConnected] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Initialize canvas with white background when component mounts
  useEffect(() => {
    if (canvasRef.current) {
      initializeCanvas();
      detectTabletSupport();
    }
  }, []);

  // Detect if drawing tablet/stylus support is available
  const detectTabletSupport = () => {
    // Check if Pointer Events API is supported
    if (window.PointerEvent) {
      setIsTabletConnected(true);
      console.log('Pointer Events API supported - tablet/stylus input enabled');
    }
  };

  // Initialize canvas with white background
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Get the correct coordinates and pressure data from pointer/mouse/touch events
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };

    const rect = canvas.getBoundingClientRect();

    // Calculate the scaling factor between the internal canvas size and displayed size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY, pressure = 0.5;

    if ('pointerId' in e.nativeEvent) {
      // Pointer event (stylus, pen, mouse)
      const pointerEvent = e.nativeEvent as PointerEvent;
      clientX = pointerEvent.offsetX;
      clientY = pointerEvent.offsetY;
      pressure = pointerEvent.pressure || 0.5;

      // Detect if this is a stylus/pen input
      if (pointerEvent.pointerType === 'pen' && pointerEvent.pressure > 0) {
        setIsPressureSensitive(true);
      }
    } else if ('touches' in e) {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      clientX = touch.clientX - rect.left;
      clientY = touch.clientY - rect.top;
      pressure = (touch as any).force || 0.5; // Some devices support force
    } else {
      // Mouse event
      clientX = e.nativeEvent.offsetX;
      clientY = e.nativeEvent.offsetY;
      pressure = 0.5; // Default pressure for mouse
    }

    // Apply the scaling to get accurate coordinates
    return {
      x: clientX * scaleX,
      y: clientY * scaleY,
      pressure: Math.max(0.1, Math.min(1.0, pressure)) // Clamp pressure between 0.1 and 1.0
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for palm rejection - ignore large touch areas when stylus is detected
    if ('touches' in e && isPressureSensitive) {
      const touch = e.touches[0];
      if ((touch as any).radiusX > 20 || (touch as any).radiusY > 20) {
        return; // Likely palm touch, ignore
      }
    }

    const { x, y } = getCoordinates(e);

    // Prevent default behavior to avoid scrolling on touch devices
    if ('touches' in e || 'pointerId' in e.nativeEvent) {
      e.preventDefault();
    }

    // Start a new path without clearing the canvas
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (!isDrawing) return;

    // Check for palm rejection - ignore large touch areas when stylus is detected
    if ('touches' in e && isPressureSensitive) {
      const touch = e.touches[0];
      if ((touch as any).radiusX > 20 || (touch as any).radiusY > 20) {
        return; // Likely palm touch, ignore
      }
    }

    // Prevent default behavior to avoid scrolling on touch devices
    if ('touches' in e || 'pointerId' in e.nativeEvent) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y, pressure } = getCoordinates(e);

    // Calculate pressure-sensitive line width
    const pressureLineWidth = isPressureSensitive
      ? Math.max(1, brushSize * pressure)
      : brushSize;

    ctx.lineWidth = pressureLineWidth;
    ctx.lineCap = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;

      // Apply pressure-sensitive opacity for more natural drawing
      if (isPressureSensitive) {
        ctx.globalAlpha = Math.max(0.3, pressure);
      } else {
        ctx.globalAlpha = 1.0;
      }
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Convert canvas to file and notify parent
      convertCanvasToFile();
    }
  };

  const convertCanvasToFile = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas to ensure white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Fill with white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the original canvas content on top of the white background
    tempCtx.drawImage(canvas, 0, 0);

    // Convert to blob and then to File
    tempCanvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'drawing.png', { type: 'image/png' });
        onDrawingComplete(file);
      }
    }, 'image/png');
  }, [onDrawingComplete]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with white instead of just clearing
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear enhanced image
    setEnhancedImage(null);
    setSelectedStyle(null);

    // Notify parent that canvas is cleared (empty drawing)
    convertCanvasToFile();
  };

  const handleEnhanceImage = async (style: EnhancementStyle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsEnhancing(true);
    setSelectedStyle(style);

    try {
      // Get the current drawing as base64
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('Failed to get canvas context');

      // Fill with white background
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the original canvas content
      tempCtx.drawImage(canvas, 0, 0);

      const drawingData = tempCanvas.toDataURL('image/png').split(',')[1];

      // Enhance the image
      const result = await enhanceImage({
        imageData: drawingData,
        style: style
      });

      if (result.success && result.imageData) {
        const enhancedImageUrl = `data:image/png;base64,${result.imageData}`;
        setEnhancedImage(enhancedImageUrl);

        // Convert enhanced image to file and notify parent
        const response = await fetch(enhancedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], `enhanced-${style.id}.png`, { type: 'image/png' });
        onDrawingComplete(file);
      } else {
        console.error('Enhancement failed:', result.error);
        alert(`Enhancement failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      alert('Failed to enhance image. Please try again.');
    } finally {
      setIsEnhancing(false);
      setShowStyleSelector(false);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPenColor(e.target.value);
  };

  const openColorPicker = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      openColorPicker();
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas to ensure white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Fill with white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the original canvas content
    tempCtx.drawImage(canvas, 0, 0);

    // Download
    const dataUrl = tempCanvas.toDataURL('image/png');
    downloadImage(dataUrl, 'my-drawing.png');
  };

  const handleDownloadEnhanced = () => {
    if (!enhancedImage) return;
    const filename = selectedStyle ? `enhanced-${selectedStyle.id}.png` : 'enhanced-drawing.png';
    downloadImage(enhancedImage, filename);
  };

  // Add touch event prevention
  useEffect(() => {
    const preventTouchDefault = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', preventTouchDefault, {
        passive: false,
      });
      canvas.addEventListener('touchmove', preventTouchDefault, {
        passive: false,
      });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', preventTouchDefault);
        canvas.removeEventListener('touchmove', preventTouchDefault);
      }
    };
  }, [isDrawing]);

  return (
    <div className={`bg-white/90 backdrop-blur-sm border-2 border-green-300/50 rounded-lg p-4 shadow-lg ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{t('canvas.title')}</h3>
        {/* Tablet Status Indicator */}
        <div className="flex items-center gap-2 text-sm">
          {isTabletConnected && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-600 rounded">
              <span>🖊️</span>
              <span>{t('canvas.tabletDetected')}</span>
            </div>
          )}
          {isPressureSensitive && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 rounded">
              <span>💪</span>
              <span>{t('canvas.pressureSupport')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Drawing Tools */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        {/* Tool Selection */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTool('pen')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              tool === 'pen'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🖊️ {t('canvas.pen')}
          </button>
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              tool === 'eraser'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🧽 {t('canvas.eraser')}
          </button>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t('canvas.color')}:</span>
          <button
            type="button"
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border-2 border-gray-300 shadow-sm transition-transform hover:scale-110"
            onClick={openColorPicker}
            onKeyDown={handleKeyDown}
            aria-label="Open color picker"
            style={{ backgroundColor: penColor }}
            disabled={tool === 'eraser'}
          >
            <input
              ref={colorInputRef}
              type="color"
              value={penColor}
              onChange={handleColorChange}
              className="opacity-0 absolute w-px h-px"
              aria-label="Select pen color"
            />
          </button>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{t('canvas.brushSize')}:</span>
          <button
            type="button"
            onClick={() => setBrushSize(Math.max(1, brushSize - 2))}
            className="w-6 h-6 rounded flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 text-sm font-bold"
          >
            −
          </button>
          <span className="text-sm font-mono w-6 text-center">{brushSize}</span>
          <button
            type="button"
            onClick={() => setBrushSize(Math.min(20, brushSize + 2))}
            className="w-6 h-6 rounded flex items-center justify-center bg-white border border-gray-300 hover:bg-gray-100 text-sm font-bold"
          >
            +
          </button>
        </div>

        {/* Enhancement Button */}
        <button
          type="button"
          onClick={() => setShowStyleSelector(!showStyleSelector)}
          disabled={isEnhancing}
          className="flex items-center gap-1 px-3 py-1 rounded bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors disabled:opacity-50"
        >
          ✨
          <span className="text-sm">
            {isEnhancing ? t('enhancement.enhancing') : t('enhancement.enhance')}
          </span>
        </button>

        {/* Clear Button */}
        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center gap-1 px-3 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          aria-label={t('canvas.clear')}
        >
          🗑️
          <span className="text-sm">{t('canvas.clear')}</span>
        </button>
      </div>

      {/* Style Selector Modal */}
      {showStyleSelector && (
        <div className="mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border-2 border-green-300/50 shadow-lg">
          <h4 className="text-md font-semibold mb-3 text-gray-700">
            ✨ {t('enhancement.selectStyle')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ENHANCEMENT_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => handleEnhanceImage(style)}
                disabled={isEnhancing}
                className="p-3 text-center rounded-lg border-2 border-green-200 hover:border-green-400 hover:bg-white/90 transition-colors disabled:opacity-50 bg-white/80 backdrop-blur-sm"
              >
                <div className="text-2xl mb-1">{style.emoji}</div>
                <div className="text-sm font-medium text-gray-700">{t(`enhancement.styles.${style.id}`)}</div>
                <div className="text-xs text-gray-500 mt-1">{t(`enhancement.descriptions.${style.id}`)}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowStyleSelector(false)}
            className="mt-3 px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
          >
            {t('camera.close')}
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Original Drawing Canvas */}
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-600 mb-2 flex items-center justify-between">
            <span>{enhancedImage ? t('canvas.title') : t('canvas.title')}</span>
            <button
              onClick={handleDownloadDrawing}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded flex items-center gap-1 transition-colors"
              title={t('enhancement.download')}
            >
              <span>⬇️</span>
              <span>{t('enhancement.download')}</span>
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            className="border-2 border-gray-300 w-full h-64 hover:cursor-crosshair bg-white touch-none rounded"
            style={{ touchAction: 'none' }} // Prevent default touch behaviors
          />
        </div>

        {/* Enhanced Image Display */}
        {enhancedImage && (
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-600 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{t('enhancement.title')}</span>
                {selectedStyle && (
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                    {selectedStyle.emoji} {t(`enhancement.styles.${selectedStyle.id}`)}
                  </span>
                )}
              </div>
              <button
                onClick={handleDownloadEnhanced}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded flex items-center gap-1 transition-colors"
                title={t('enhancement.download')}
              >
                <span>⬇️</span>
                <span>{t('enhancement.download')}</span>
              </button>
            </div>
            <div className="border-2 border-green-300/70 rounded h-64 overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg">
              <img
                src={enhancedImage}
                alt={t('enhancement.title')}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 mt-2 text-center space-y-1">
        <p>
          {t('canvas.title')}
        </p>
        {isTabletConnected && (
          <p className="text-xs text-blue-600">
            {isPressureSensitive
              ? `🎨 ${t('canvas.tabletDetected')}! ${t('canvas.pressureSupport')}`
              : `🖊️ ${t('canvas.tabletDetected')}`
            }
          </p>
        )}
      </div>
    </div>
  );
};