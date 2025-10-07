import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Header
      title: "AIKnowDraw - AI Art Companion",
      subtitle: "Create, draw, and explore emotions with Professor Panda",

      // Language Toggle
      language: "Language",
      english: "English",
      chinese: "繁體中文",

      // Input Mode
      drawPicture: "Draw Picture",
      uploadPhoto: "Upload Photo",
      takePhoto: "Take Photo",

      // Drawing Canvas
      canvas: {
        title: "Drawing Canvas",
        pen: "Pen",
        eraser: "Eraser",
        color: "Color",
        brushSize: "Brush Size",
        clear: "Clear Canvas",
        save: "Save Drawing",
        undo: "Undo",
        redo: "Redo",
        tabletDetected: "Drawing Tablet Detected",
        tabletNotDetected: "No Tablet Detected",
        pressureSupport: "Pressure sensitivity enabled"
      },

      // Image Uploader
      uploader: {
        dragDrop: "Drag and drop an image here, or click to select",
        supported: "Supported formats: JPEG, PNG, GIF, WebP",
        uploadImage: "Upload Image",
        changeImage: "Change Image",
        removeImage: "Remove Image",
        exampleImages: "Example Images",
        selectExample: "Select an example"
      },

      // Camera
      camera: {
        title: "Take a Photo",
        capture: "Capture Photo",
        retake: "Retake",
        use: "Use Photo",
        close: "Close Camera",
        noAccess: "Camera access denied. Please enable camera permissions."
      },

      // Conversation
      conversation: {
        title: "Chat with the Art View",
        startPrompt: "After uploading a drawing, ask something to get started!",
        example: "For example: \"What do you think of my picture?\"",
        defaultQuestion: "Do you want to talk about the picture?",
        placeholder: "Ask about your drawing...",
        followUpPlaceholder: "Ask a follow-up question...",
        send: "Send",
        clear: "Start Over",
        listening: "Listening...",
        speak: "Speak Prompt",
        stopListening: "Stop Listening",
        you: "You"
      },

      // Image Enhancement
      enhancement: {
        title: "Enhance Your Drawing",
        selectStyle: "Select a style to transform your artwork",
        enhance: "Enhance Image",
        enhancing: "Enhancing...",
        download: "Download Enhanced Image",
        styles: {
          childhood: "Childhood Magic",
          digital: "Digital Art",
          graphic: "Graphic Design",
          photorealistic: "Photorealistic",
          artistic: "Artistic Painting",
          abstract: "Abstract Modern",
          minimalist: "Minimalist",
          impressive: "Dramatic & Impressive"
        },
        descriptions: {
          childhood: "Whimsical, colorful, childlike wonder",
          digital: "Modern digital illustration style",
          graphic: "Bold, clean, professional design",
          photorealistic: "Realistic, detailed, lifelike",
          artistic: "Traditional art style with brushstrokes",
          abstract: "Abstract interpretation with modern elements",
          minimalist: "Clean, simple, elegant design",
          impressive: "Bold, striking, attention-grabbing"
        }
      },

      // Errors
      errors: {
        imageLoad: "Could not load the image. Please try again.",
        invalidFile: "Invalid file type. Please upload a valid image file.",
        noImage: "Please upload an image before starting the conversation.",
        apiError: "An error occurred. Please try again.",
        networkError: "Network error. Please check your connection.",
        enhancementFailed: "Image enhancement failed. Please try again."
      },

      // Queue Status
      queue: {
        idle: "Ready",
        processing: "Processing requests...",
        waiting: "Waiting in queue...",
        requests: "{{count}} request in queue",
        requests_plural: "{{count}} requests in queue"
      },

      // Professor Panda System Prompt
      systemPrompt: `You are Professor Panda, a warm and enthusiastic AI art therapist with graduate-level training in developmental psychology. You have a deep understanding of how children express themselves through art, and you're passionate about helping people explore the emotions and stories behind their drawings.

Your approach:
- Be warm, encouraging, and genuinely curious about the artwork
- Ask open-ended questions that invite deeper reflection
- Comment on specific elements (colors, shapes, subjects) with psychological insight
- Help identify emotions and developmental milestones reflected in the art
- Provide age-appropriate feedback
- Encourage creative expression and emotional exploration
- Use simple, accessible language
- Be supportive and non-judgmental

When analyzing artwork, consider:
1. Color choices and emotional associations
2. Subject matter and personal significance
3. Drawing style and developmental stage
4. Fine motor skills and creative confidence
5. Storytelling elements and imagination
6. Emotional themes and self-expression

Always maintain a friendly, professional tone that balances therapeutic insight with genuine appreciation for the artwork.`
    }
  },
  'zh-TW': {
    translation: {
      // Header
      title: "AIKnowDraw - AI 藝術夥伴",
      subtitle: "與熊貓教授一起創作、繪畫、探索情感",

      // Language Toggle
      language: "語言",
      english: "English",
      chinese: "繁體中文",

      // Input Mode
      drawPicture: "繪製圖畫",
      uploadPhoto: "上傳照片",
      takePhoto: "拍攝照片",

      // Drawing Canvas
      canvas: {
        title: "繪畫畫布",
        pen: "畫筆",
        eraser: "橡皮擦",
        color: "顏色",
        brushSize: "筆刷大小",
        clear: "清空畫布",
        save: "儲存繪畫",
        undo: "復原",
        redo: "重做",
        tabletDetected: "已偵測到繪圖板",
        tabletNotDetected: "未偵測到繪圖板",
        pressureSupport: "已啟用壓力感應"
      },

      // Image Uploader
      uploader: {
        dragDrop: "將圖片拖放到這裡，或點擊選擇",
        supported: "支援格式：JPEG、PNG、GIF、WebP",
        uploadImage: "上傳圖片",
        changeImage: "更換圖片",
        removeImage: "移除圖片",
        exampleImages: "範例圖片",
        selectExample: "選擇範例"
      },

      // Camera
      camera: {
        title: "拍攝照片",
        capture: "拍攝",
        retake: "重拍",
        use: "使用照片",
        close: "關閉相機",
        noAccess: "相機存取被拒絕。請啟用相機權限。"
      },

      // Conversation
      conversation: {
        title: "與藝術視圖對話",
        startPrompt: "上傳繪畫後，提出問題開始對話！",
        example: "例如：「你覺得我的畫怎麼樣？」",
        defaultQuestion: "你想談談這幅畫嗎？",
        placeholder: "詢問關於你的繪畫...",
        followUpPlaceholder: "提出後續問題...",
        send: "傳送",
        clear: "重新開始",
        listening: "正在聆聽...",
        speak: "語音輸入",
        stopListening: "停止聆聽",
        you: "你"
      },

      // Image Enhancement
      enhancement: {
        title: "增強你的繪畫",
        selectStyle: "選擇風格來轉換你的藝術作品",
        enhance: "增強圖片",
        enhancing: "增強中...",
        download: "下載增強圖片",
        styles: {
          childhood: "童年魔法",
          digital: "數位藝術",
          graphic: "平面設計",
          photorealistic: "照片寫實",
          artistic: "藝術繪畫",
          abstract: "現代抽象",
          minimalist: "極簡主義",
          impressive: "戲劇性與震撼"
        },
        descriptions: {
          childhood: "異想天開、色彩繽紛、童趣滿滿",
          digital: "現代數位插畫風格",
          graphic: "大膽、簡潔、專業設計",
          photorealistic: "寫實、細緻、栩栩如生",
          artistic: "傳統藝術風格與筆觸",
          abstract: "具現代元素的抽象詮釋",
          minimalist: "簡潔、簡約、優雅設計",
          impressive: "大膽、引人注目、震撼視覺"
        }
      },

      // Errors
      errors: {
        imageLoad: "無法載入圖片。請重試。",
        invalidFile: "無效的檔案類型。請上傳有效的圖片檔案。",
        noImage: "開始對話前請先上傳圖片。",
        apiError: "發生錯誤。請重試。",
        networkError: "網路錯誤。請檢查你的連線。",
        enhancementFailed: "圖片增強失敗。請重試。"
      },

      // Queue Status
      queue: {
        idle: "就緒",
        processing: "處理請求中...",
        waiting: "等待佇列中...",
        requests: "佇列中有 {{count}} 個請求",
        requests_plural: "佇列中有 {{count}} 個請求"
      },

      // Professor Panda System Prompt (in Traditional Chinese)
      systemPrompt: `你是熊貓教授，一位溫暖且充滿熱情的 AI 藝術治療師，擁有發展心理學的研究所學歷。你深刻理解兒童如何透過藝術表達自己，並熱衷於幫助人們探索繪畫背後的情感和故事。

你的方法：
- 保持溫暖、鼓勵並真誠好奇藝術作品
- 提出開放式問題，邀請更深層的反思
- 以心理學洞察力評論特定元素（顏色、形狀、主題）
- 幫助識別藝術中反映的情感和發展里程碑
- 提供適齡的反饋
- 鼓勵創意表達和情感探索
- 使用簡單易懂的語言
- 保持支持且不帶批判

分析藝術作品時，請考慮：
1. 顏色選擇與情感關聯
2. 主題和個人意義
3. 繪畫風格和發展階段
4. 精細動作技能和創作信心
5. 故事元素和想像力
6. 情感主題和自我表達

始終保持友善、專業的語氣，在治療洞察力與對藝術作品的真誠欣賞之間取得平衡。`
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // default language
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
