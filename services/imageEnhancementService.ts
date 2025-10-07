import { GoogleGenAI, Modality } from '@google/genai';
import { requestQueue } from './requestQueue';

const API_KEY = process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set.");
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

export interface EnhancementStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  emoji: string;
}

export const ENHANCEMENT_STYLES: EnhancementStyle[] = [
  {
    id: 'childhood',
    name: 'Childhood Magic',
    description: 'Whimsical, colorful, childlike wonder',
    prompt: 'Transform this sketch into a magical childhood illustration with bright colors, playful elements, and innocent wonder. Make it look like a beautiful children\'s book illustration.',
    emoji: '🌈'
  },
  {
    id: 'digital',
    name: 'Digital Art',
    description: 'Modern digital illustration style',
    prompt: 'Convert this sketch into a polished digital artwork with clean lines, vibrant colors, and modern digital art styling. Use contemporary illustration techniques.',
    emoji: '💻'
  },
  {
    id: 'graphic',
    name: 'Graphic Design',
    description: 'Bold, clean, professional design',
    prompt: 'Transform this sketch into a professional graphic design with bold shapes, clean typography elements, and modern design principles. Make it suitable for branding or marketing.',
    emoji: '🎨'
  },
  {
    id: 'photorealistic',
    name: 'Photorealistic',
    description: 'Realistic, detailed, lifelike',
    prompt: 'Convert this sketch into a photorealistic image with detailed textures, proper lighting, shadows, and realistic proportions. Make it look like a high-quality photograph.',
    emoji: '📸'
  },
  {
    id: 'artistic',
    name: 'Artistic Painting',
    description: 'Traditional art style with brushstrokes',
    prompt: 'Transform this sketch into a beautiful artistic painting with visible brushstrokes, rich colors, and traditional painting techniques like oil or watercolor.',
    emoji: '🖼️'
  },
  {
    id: 'abstract',
    name: 'Abstract Modern',
    description: 'Abstract interpretation with modern elements',
    prompt: 'Reimagine this sketch as an abstract modern artwork with geometric shapes, bold colors, and contemporary artistic interpretation.',
    emoji: '🔲'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, simple, elegant design',
    prompt: 'Convert this sketch into a minimalist design with clean lines, simple shapes, limited color palette, and elegant simplicity.',
    emoji: '⚪'
  },
  {
    id: 'impressive',
    name: 'Dramatic & Impressive',
    description: 'Bold, striking, attention-grabbing',
    prompt: 'Transform this sketch into an impressive, dramatic artwork with bold colors, striking composition, dynamic lighting, and powerful visual impact.',
    emoji: '⚡'
  }
];

export interface EnhanceImageParams {
  imageData: string; // base64 image data
  style: EnhancementStyle;
  customPrompt?: string;
}

export interface EnhanceImageResult {
  success: boolean;
  imageData?: string; // base64 enhanced image
  error?: string;
}

export const enhanceImage = async (params: EnhanceImageParams): Promise<EnhanceImageResult> => {
  // Wrap the API call in the request queue
  return requestQueue.enqueue(async () => {
    try {
      const { imageData, style, customPrompt } = params;

      const finalPrompt = customPrompt || style.prompt;

      const contents = [
        {
          role: 'USER' as const,
          parts: [
            {
              inlineData: {
                data: imageData,
                mimeType: 'image/png'
              }
            }
          ]
        },
        {
          role: 'USER' as const,
          parts: [
            {
              text: `${finalPrompt}. Keep the essence and main elements of the original sketch but enhance it according to the style description. Make it visually appealing and maintain the same general composition.`
            }
          ]
        }
      ];

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      // Extract image data from response
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return {
            success: true,
            imageData: part.inlineData.data
          };
        }
      }

      return {
        success: false,
        error: 'No image data returned from the model'
      };

    } catch (error) {
      console.error('Image enhancement error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }, 'normal'); // Use normal priority, can be 'high' for important requests
};