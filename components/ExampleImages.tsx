import React from 'react';
import { EXAMPLE_IMAGES } from '../constants';

interface ExampleImagesProps {
  onImageSelect: (url: string) => void;
  currentImageUrl?: string | null;
}

const CheckmarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


export const ExampleImages: React.FC<ExampleImagesProps> = ({ onImageSelect, currentImageUrl }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center">Or Try an Example</h3>
      <div className="grid grid-cols-3 gap-3">
        {EXAMPLE_IMAGES.map((image) => {
          const isSelected = currentImageUrl === image.url;
          return (
            <button
              key={image.name}
              onClick={() => onImageSelect(image.url)}
              className={`relative rounded-lg overflow-hidden border-4 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
              title={`Use ${image.name} example`}
            >
              <img src={image.url} alt={image.name} className="w-full h-24 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end justify-center">
                  <p className="text-white text-sm font-bold pb-1">{image.name}</p>
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1 shadow-lg">
                  <CheckmarkIcon />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  );
};