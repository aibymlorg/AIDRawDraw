# AIKnowDraw - AI Art Companion

> Create, draw, and explore emotions with Professor Panda - your friendly AI art therapist with psychology training!

## Overview

AIKnowDraw is an interactive art therapy application that combines drawing capabilities with AI-powered conversation. Users can create artwork through a canvas interface or upload images, then engage with Professor Panda, an AI art therapist trained in developmental psychology, to explore the emotional and artistic meaning behind their creations.

## Architecture & Service Flow

### LLM Service Flow

```
User Input (Drawing/Upload/Camera)
         ↓
   Application Layer (App.tsx)
         ↓
   LLM Service Router (llmService.ts) ← Selects provider based on .env config
         ↓
    ┌────┴────┐
    ↓         ↓
Gemini    Ollama
Service   Service
    ↓         ↓
    └────┬────┘
         ↓
  Request Queue Manager (requestQueue.ts)
         ↓
  ┌──────┴──────┐
  ↓             ↓
Chat API    Image Enhancement API
  ↓             ↓
Stream      Generated
Response    Images
  ↓             ↓
Conversation Display
```

### Service Components

#### 1. **LLM Service Router** (`llmService.ts`)
- **Purpose**: Abstraction layer for switching between LLM providers
- **Providers**:
  - Google Gemini (default)
  - Ollama (local alternative)
- **Configuration**: Set via `REACT_APP_LLM_PROVIDER` environment variable

#### 2. **Gemini Service** (`geminiService.ts`)
- **Model**: `gemini-2.0-flash-exp`
- **Features**:
  - Multimodal input support (text + images)
  - Streaming responses for real-time conversation
  - Safety settings configured to prevent blocking
- **Queue Integration**: All requests routed through request queue with high priority for chat messages

#### 3. **Image Enhancement Service** (`imageEnhancementService.ts`)
- **Model**: `gemini-2.5-flash-image-preview`
- **Features**: 8 artistic transformation styles
  - 🌈 Childhood Magic - Whimsical, colorful wonder
  - 💻 Digital Art - Modern illustration
  - 🎨 Graphic Design - Professional design
  - 📸 Photorealistic - Realistic rendering
  - 🖼️ Artistic Painting - Traditional brushstrokes
  - 🔲 Abstract Modern - Contemporary interpretation
  - ⚪ Minimalist - Clean, elegant design
  - ⚡ Dramatic & Impressive - Bold, striking
- **Queue Integration**: Normal priority requests to prevent blocking chat

#### 4. **Request Queue Manager** (`requestQueue.ts`)
- **Purpose**: Rate limiting and error handling for API requests
- **Features**:
  - Concurrent request management (max 3 simultaneous)
  - Rate limiting (1 second between requests)
  - Automatic retry with exponential backoff (3 retries max)
  - Priority queue system (high/normal)
- **Benefits**: Prevents API crashes, handles rate limits gracefully

### Data Flow

1. **User creates/uploads image** → Image stored in application state
2. **User sends message** → Message + image (first message only) sent to LLM service
3. **LLM Router** → Selects provider (Gemini/Ollama)
4. **Request Queue** → Manages API call timing and retries
5. **Gemini Service** → Processes request and streams response
6. **Response Display** → Real-time streaming text displayed in chat

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Google Gemini API key (free tier available) OR Ollama server (for local use)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/aibymlorg/AIKnowDraw.git
   cd AIKnowDraw
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   # LLM Provider: 'gemini' (cloud) or 'ollama' (local)
   REACT_APP_LLM_PROVIDER=gemini

   # Gemini API Configuration (required if using Gemini)
   REACT_APP_GEMINI_API_KEY=your_api_key_here
   GEMINI_API_KEY=your_api_key_here

   # Ollama Configuration (required if using Ollama)
   REACT_APP_OLLAMA_URL=http://localhost:11434
   REACT_APP_OLLAMA_MODEL=llama3.2-vision:latest
   ```

4. **Get your Gemini API key** (if using Gemini)
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy and paste it into your `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`

### Alternative: Using Ollama (Local LLM)

1. **Install Ollama** from [ollama.ai](https://ollama.ai)
2. **Pull the vision model**:
   ```bash
   ollama pull llama3.2-vision:latest
   ```
3. **Start Ollama server**:
   ```bash
   ollama serve
   ```
4. **Update `.env`**:
   ```env
   REACT_APP_LLM_PROVIDER=ollama
   ```

## NPM Scripts

### `npm run dev`
**Purpose**: Start development server with hot module replacement
**Port**: 5173 (default)
**Use case**: Active development and testing

**Features**:
- Instant hot reload on file changes
- Source maps for debugging
- Environment variable injection from `.env`

### `npm run build`
**Purpose**: Build optimized production bundle
**Output**: `dist/` directory

**Process**:
1. TypeScript compilation and type checking
2. React component bundling
3. Asset optimization (minification, tree-shaking)
4. Environment variable embedding

**Use case**: Deployment to production hosting (Vercel, Netlify, etc.)

### `npm run preview`
**Purpose**: Preview production build locally
**Port**: 4173 (default)

**Use case**: Testing the production build before deployment to verify:
- Build optimization worked correctly
- No runtime errors in minified code
- Environment variables configured properly

## Technology Stack

- **Frontend**: React 19.1.1 with TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **AI Integration**:
  - Google Gemini API (`@google/genai` ^1.20.0)
  - Ollama (local alternative)
- **Drawing**: HTML5 Canvas with Pointer Events API
- **Voice**: Web Speech Recognition API

## Key Features

- **Advanced Drawing Canvas**: Pressure-sensitive drawing with tablet support
- **AI Art Therapist**: Psychology-informed conversation with Professor Panda
- **Multi-modal Input**: Draw, upload, or capture photos via camera
- **Image Enhancement**: 8 artistic transformation styles (premium feature)
- **Voice & Text Chat**: Flexible communication modes
- **Request Queue Management**: Robust API handling with automatic retries

## API Tiers

### Free Tier (Gemini)
- ✅ Text conversations with Professor Panda
- ✅ Image analysis and psychological insights
- ✅ Voice recognition
- ✅ All drawing features

### Premium Tier (Requires Paid API)
- ❌ AI image enhancement (8 artistic styles)
- ❌ High-resolution image generation

## Troubleshooting

### Common Issues

**API Key Error**:
```
Error: REACT_APP_GEMINI_API_KEY environment variable not set
```
**Solution**: Ensure `.env` file exists with valid API key

**Rate Limit Errors**:
- The request queue automatically handles rate limits with retries
- Check console for queue status: `[Queue] Added request...`

**Ollama Connection Error**:
```
Error: Failed to connect to Ollama server
```
**Solution**: Verify Ollama server is running: `ollama serve`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/aibymlorg/AIKnowDraw/issues)
- **Documentation**: Project README and inline code comments

---

*Built with ❤️ for creativity, expression, and emotional growth*
