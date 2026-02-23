# RunAnywhere AI - On-Device AI Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-blue)](https://www.w3.org/TR/webgpu/)
[![Offline](https://img.shields.io/badge/Offline-Ready-green)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

A privacy-first, offline-capable AI assistant that runs entirely in your browser. No cloud dependencies, no data collection, complete user control.

## ✨ Features

### 🔒 Privacy First
- **100% On-Device Processing** - All AI runs locally in your browser
- **Zero Cloud Dependency** - Works completely offline after initial model download
- **Privacy Mode** - Toggle to prevent any cloud logging
- **Full Data Control** - Export or delete your data anytime

### ⚡ Performance
- **Zero Network Latency** - No API calls, instant responses
- **WebGPU Acceleration** - Hardware-accelerated inference
- **Optimized Models** - Fast, efficient on-device models
- **Sub-100ms Response** - First token in under 100ms

### 🎯 Capabilities
- **💬 Chat** - Conversational AI assistant
- **📷 Vision** - Image understanding and description
- **🎙️ Voice** - Speech-to-text and text-to-speech

### 📊 Data Management
- **Local Storage** - All data stored in your browser
- **CSV Export** - Download your data as CSV
- **JSON Export** - Export in JSON format
- **Cloud Backup** - Optional Supabase integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern browser with WebGPU support (Chrome 113+, Edge 113+)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/runanywhere-ai.git
cd runanywhere-ai/web-starter-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📦 Project Structure

```
web-starter-app/
├── src/
│   ├── components/       # React components
│   │   ├── ChatTab.tsx
│   │   ├── VisionTab.tsx
│   │   ├── VoiceTab.tsx
│   │   └── SettingsModal.tsx
│   ├── hooks/           # Custom React hooks
│   ├── workers/         # Web Workers for AI processing
│   ├── styles/          # CSS styles
│   ├── App.tsx          # Main app component
│   ├── runanywhere.ts   # SDK initialization
│   ├── privacy.ts       # Privacy controls
│   ├── dataControl.ts   # Data management
│   └── supabse.ts       # Optional cloud storage
├── public/
│   ├── sw.js           # Service Worker for offline support
│   └── manifest.json   # PWA manifest
└── supabase-schema.sql # Database schema (optional)
```

## 🔧 Configuration

### Supabase Setup (Optional)

If you want cloud backup:

1. Create a Supabase project at https://supabase.com
2. Run the SQL in `supabase-schema.sql`
3. Create storage bucket `chat-exports` (see `SUPABASE_STORAGE_SETUP.md`)
4. Update credentials in `src/supabse.ts`

### Privacy Mode

Privacy mode is **enabled by default**. When enabled:
- No data sent to cloud
- All processing on-device
- Data stored locally only

Toggle via the 🔒 button in the header or Settings (⚙️).

## 🎨 Features in Detail

### Chat Assistant
- Powered by LiquidAI LFM2 350M model
- Streaming responses for real-time feedback
- Conversation history with stats
- Quick prompt suggestions

### Vision Understanding
- Camera integration for live analysis
- Single-shot and live mode
- Customizable prompts
- Fast inference with optimized models

### Voice Assistant
- Voice Activity Detection (VAD)
- Speech-to-Text (Whisper Tiny)
- Text-to-Speech (Piper TTS)
- Complete voice pipeline

## 📱 Progressive Web App

Install as a standalone app:
1. Visit the app in Chrome/Edge
2. Click the install icon in the address bar
3. Use like a native app, works offline!

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## 🌐 Browser Support

| Browser | Version | WebGPU | Status |
|---------|---------|--------|--------|
| Chrome  | 113+    | ✅     | ✅ Full Support |
| Edge    | 113+    | ✅     | ✅ Full Support |
| Firefox | 121+    | 🚧     | ⚠️ Experimental |
| Safari  | 18+     | 🚧     | ⚠️ Limited |

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 🙏 Acknowledgments

- [RunAnywhere SDK](https://github.com/runanywhere/runanywhere-sdks) - On-device AI framework
- [LiquidAI](https://www.liquid.ai/) - LFM2 models
- [Supabase](https://supabase.com/) - Optional cloud storage

## 📞 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our community](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/runanywhere-ai/issues)

---

**Built with ❤️ for privacy and performance**
