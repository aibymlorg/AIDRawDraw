<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# KnowKidDraw - AI Art Gallery

An interactive AI-powered application that analyzes children's drawings and provides encouraging, educational feedback from "Professor Panda," a friendly AI art teacher. The app supports multiple LLM providers and offers real-time conversation capabilities.

View your app in AI Studio: https://ai.studio/apps/drive/1POQrykocjrVNbKh5883eYFsjQRbNBUdF

## 🏗️ Architecture

The application follows a modular React architecture with clean separation of concerns:

- **Frontend**: React 19 with TypeScript for type safety
- **Build Tool**: Vite for fast development and building
- **AI Integration**: Supports multiple LLM providers (Gemini AI, Ollama)
- **State Management**: React hooks for local state management
- **File Processing**: Built-in image handling and camera integration

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **CSS** - Custom styling (no framework dependencies)

### AI & APIs
- **Google Gemini AI** - Primary AI provider for image analysis
- **Ollama** - Local AI model support for privacy-focused deployments
- **@google/genai** - Official Google Generative AI SDK

### Development Tools
- **Node.js** - Runtime environment
- **npm** - Package management
- **ESLint** - Code linting (configured via TypeScript)

## 📁 File Structure

```
knowkiddraw/
├── components/              # React components
│   ├── CameraModal.tsx     # Camera capture functionality
│   ├── Conversation.tsx    # Chat interface
│   ├── ExampleImages.tsx   # Sample images gallery
│   ├── Header.tsx          # Application header
│   ├── ImageUploader.tsx   # Image upload interface
│   └── Spinner.tsx         # Loading indicator
├── services/               # AI service integrations
│   ├── geminiService.ts    # Google Gemini AI integration
│   ├── llmService.ts       # Unified LLM provider interface
│   └── ollamaService.ts    # Ollama local AI integration
├── hooks/                  # Custom React hooks
├── utils/                  # Utility functions
│   └── fileUtils.ts        # File processing utilities
├── public/                 # Static assets
│   └── images/             # Example images and assets
├── dist/                   # Build output directory
├── App.tsx                 # Main application component
├── constants.ts            # Application constants and prompts
├── types.ts                # TypeScript type definitions
├── index.tsx               # Application entry point
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables template
└── .env.local              # Local environment variables
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- **API Key** for your chosen LLM provider:
  - Google Gemini AI API key, OR
  - Local Ollama installation

### Installation Steps

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd knowkiddraw
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Copy the example environment file:
   ```bash
   cp .env .env.local
   ```

   Edit `.env.local` and configure your settings:
   ```env
   # LLM Provider Configuration
   REACT_APP_LLM_PROVIDER=gemini          # or 'ollama'

   # For Gemini AI (if using gemini provider)
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

   # For Ollama (if using ollama provider)
   REACT_APP_OLLAMA_URL=http://localhost:11434
   REACT_APP_OLLAMA_MODEL=llava
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   The application will automatically open at `http://localhost:5173`

### Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Preview the production build:**
   ```bash
   npm run preview
   ```

## 🎯 Key Features

- **Multi-modal AI Analysis**: Upload images or use camera to capture children's drawings
- **Educational Feedback**: AI provides encouraging, age-appropriate responses
- **Multiple AI Providers**: Switch between Gemini AI and local Ollama models
- **Real-time Chat**: Interactive conversation interface with streaming responses
- **Example Gallery**: Pre-loaded sample images for quick testing
- **Camera Integration**: Built-in camera support for direct image capture
- **Type Safety**: Full TypeScript integration for robust development

## 🔧 Configuration Options

### LLM Provider Setup

#### Using Google Gemini AI (Default)
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set `REACT_APP_LLM_PROVIDER=gemini` in `.env.local`
3. Set `REACT_APP_GEMINI_API_KEY=your_key` in `.env.local`

#### Using Ollama (Local AI)
1. Install [Ollama](https://ollama.ai/) locally
2. Pull a vision model: `ollama pull llava`
3. Set `REACT_APP_LLM_PROVIDER=ollama` in `.env.local`
4. Configure `REACT_APP_OLLAMA_URL` and `REACT_APP_OLLAMA_MODEL`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to your branch: `git push origin feature-name`
5. Create a Pull Request

## 📝 License

This project is part of the AI Studio ecosystem. Please refer to the original license terms.
