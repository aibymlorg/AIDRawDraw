import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { enhanceImage, ENHANCEMENT_STYLES, type EnhancementStyle } from '../services/imageEnhancementService';

interface ImageUploaderProps {
  selectedImagePreview: string | null;
  onImageChange: (file: File) => void;
  onImageRemove: () => void;
  onOpenCamera: () => void;
}

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UploadIconLarge = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ selectedImagePreview, onImageChange, onImageRemove, onOpenCamera }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<EnhancementStyle | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageChange(event.target.files[0]);
      // Clear enhanced image when new image is uploaded
      setEnhancedImage(null);
      setSelectedStyle(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleEnhanceImage = async (style: EnhancementStyle) => {
    if (!selectedImagePreview) return;

    setIsEnhancing(true);
    setSelectedStyle(style);

    try {
      // Convert the image preview to base64
      const response = await fetch(selectedImagePreview);
      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const imageData = base64data.split(',')[1]; // Remove the data:image/png;base64, prefix

        // Enhance the image
        const result = await enhanceImage({
          imageData: imageData,
          style: style
        });

        if (result.success && result.imageData) {
          const enhancedImageUrl = `data:image/png;base64,${result.imageData}`;
          setEnhancedImage(enhancedImageUrl);

          // Convert enhanced image to file and notify parent
          const enhancedResponse = await fetch(enhancedImageUrl);
          const enhancedBlob = await enhancedResponse.blob();
          const file = new File([enhancedBlob], `enhanced-${style.id}.png`, { type: 'image/png' });
          onImageChange(file);
        } else {
          console.error('Enhancement failed:', result.error);
          alert(`Enhancement failed: ${result.error || 'Unknown error'}`);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Enhancement error:', error);
      alert('Failed to enhance image. Please try again.');
    } finally {
      setIsEnhancing(false);
      setShowStyleSelector(false);
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

  const handleDownloadOriginal = () => {
    if (!selectedImagePreview) return;
    downloadImage(selectedImagePreview, 'original-photo.png');
  };

  const handleDownloadEnhanced = () => {
    if (!enhancedImage) return;
    const filename = selectedStyle ? `enhanced-${selectedStyle.id}.png` : 'enhanced-photo.png';
    downloadImage(enhancedImage, filename);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">{t('uploader.uploadImage')}</h3>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Original Image */}
        <div className={enhancedImage ? "flex-1" : "w-full"}>
          {enhancedImage && (
            <div className="text-sm font-medium text-gray-600 mb-2 flex items-center justify-between">
              <span>{t('uploader.uploadImage')}</span>
              <button
                onClick={handleDownloadOriginal}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded flex items-center gap-1 transition-colors"
                title={t('enhancement.download')}
              >
                <span>⬇️</span>
                <span>{t('enhancement.download')}</span>
              </button>
            </div>
          )}
          <div className="relative group">
            <div
              className={`w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center transition-all ${
                selectedImagePreview
                  ? 'border-2 border-solid border-gray-300'
                  : 'border-2 border-dashed border-gray-300 bg-gray-50'
              }`}
            >
              {selectedImagePreview ? (
                <img
                  src={selectedImagePreview}
                  alt={t('uploader.uploadImage')}
                  className="object-contain h-full w-full"
                />
              ) : (
                <div className="text-center text-gray-500 p-4">
                    <UploadIconLarge />
                    <p className="mt-2 text-sm">{t('uploader.dragDrop')}</p>
                </div>
              )}
            </div>

            {selectedImagePreview && (
              <button
                onClick={onImageRemove}
                className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1.5 hover:bg-opacity-80 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={t('uploader.removeImage')}
                title={t('uploader.removeImage')}
              >
                <CloseIcon />
              </button>
            )}
          </div>
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
            <div className="border-2 border-green-300/70 rounded-lg aspect-square overflow-hidden bg-white shadow-lg">
              <img
                src={enhancedImage}
                alt={t('enhancement.title')}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={triggerFileInput}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105"
        >
          <UploadIcon />
          {selectedImagePreview ? t('uploader.changeImage') : t('uploader.uploadImage')}
        </button>
         <button
          onClick={onOpenCamera}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105"
        >
          <CameraIcon />
          {t('takePhoto')}
        </button>
      </div>

      {/* Enhancement Button */}
      {selectedImagePreview && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowStyleSelector(!showStyleSelector)}
            disabled={isEnhancing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            ✨
            <span className="font-semibold">
              {isEnhancing ? t('enhancement.enhancing') : t('enhancement.enhance')}
            </span>
          </button>
        </div>
      )}

      {/* Style Selector Modal */}
      {showStyleSelector && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 shadow-lg">
          <h4 className="text-md font-semibold mb-3 text-gray-700">
            ✨ {t('enhancement.selectStyle')}
          </h4>
          <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {ENHANCEMENT_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => handleEnhanceImage(style)}
                disabled={isEnhancing}
                className="p-3 text-center rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:bg-white transition-colors disabled:opacity-50 bg-white"
              >
                <div className="text-2xl mb-1">{style.emoji}</div>
                <div className="text-sm font-medium text-gray-700">{t(`enhancement.styles.${style.id}`)}</div>
                <div className="text-xs text-gray-500 mt-1">{t(`enhancement.descriptions.${style.id}`)}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowStyleSelector(false)}
            className="mt-3 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t('camera.close')}
          </button>
        </div>
      )}

      {selectedImagePreview && (
        <p className="text-sm text-gray-500 mt-3 text-center">
          {enhancedImage ?
            'Your photo has been enhanced! Professor Panda will analyze your enhanced creation.' :
            'Upload or capture a photo, then click "Enhance Photo" to transform it with AI styles!'
          }
        </p>
      )}
    </div>
  );
};