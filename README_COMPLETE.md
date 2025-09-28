# 📚 StudySphere - AI-Powered Learning Platform

StudySphere is a complete Next.js application that transforms PDF documents into interactive learning experiences using **Agentic RAG** (Retrieval-Augmented Generation). Upload your PDFs and unlock AI-powered summaries, intelligent quizzes, and contextual Q&A - all powered by private knowledge boxes for secure, personalized learning.

## ✨ Features

### 🔐 **Secure Document Processing**
- **Private Knowledge Boxes**: Each user has isolated document storage
- **PDF Upload & Indexing**: Automatic document ingestion and processing
- **User-Specific Context**: Documents are tagged with user IDs for privacy

### 🤖 **AI-Powered Learning Tools**
- **📝 Intelligent Summaries**: Generate concise summaries using Generator Agent
- **🧠 Smart Quizzes**: Create 5-10 MCQs with Q&A Generator Agent
- **💬 Interactive Q&A**: Ask questions with contextual answers using /ask endpoint
- **📊 Progress Tracking**: Monitor quiz performance and learning analytics

### 🎨 **Modern UI/UX**
- **KendoReact Components**: Professional grid, buttons, dialogs, and inputs
- **TailwindCSS Styling**: Clean, responsive design
- **Intuitive Navigation**: Seamless flow between features
- **Mobile-Friendly**: Responsive design for all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Agentic RAG API access (Writer, Reader, Generator, Q&A Generator)

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd studysphere
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Agentic RAG API keys
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables (.env.local)

```env
# Agentic RAG API Configuration
RAG_WRITER_URL=https://api.agentic-rag.com/writer
RAG_WRITER_KEY=your_rag_writer_api_key_here
RAG_READER_KEY=your_rag_reader_api_key_here
RAG_GENERATOR_URL=https://api.agentic-rag.com/generator
RAG_GENERATOR_KEY=your_rag_generator_api_key_here
RAG_QA_GENERATOR_URL=https://api.agentic-rag.com/qa-generator
RAG_QA_GENERATOR_KEY=your_rag_qa_generator_api_key_here
RAG_ASK_URL=https://api.agentic-rag.com/ask
```

**Demo Mode**: If API keys are not provided, the application runs with simulated responses for testing.

## 📖 Usage Guide

### 1. **Upload PDF Document**
   - Navigate to `/upload`
   - Select PDF file (max 10MB)
   - Document is processed and indexed in your private Knowledge Box

### 2. **Generate Summary**
   - Visit `/summary` 
   - AI creates intelligent summary using Generator Agent
   - View key concepts and main points

### 3. **Take Quiz**
   - Go to `/quiz`
   - Complete AI-generated multiple-choice questions
   - View detailed results with explanations

### 4. **Ask Questions**
   - Open `/question`
   - Chat with AI about document content
   - Get contextual answers with source references

## 🏗️ Architecture

### Frontend (Next.js + React)
```
pages/
├── index.js          # Home page with navigation
├── upload.js         # PDF upload interface
├── summary.js        # AI summary display
├── quiz.js          # Interactive quiz component
├── question.js      # Q&A chat interface
└── api/             # Backend API routes
    ├── upload.js    # PDF ingestion to RAG
    ├── summarize.js # Summary generation
    ├── quiz.js      # Quiz creation
    └── question.js  # Q&A endpoint

components/
└── Layout.js        # Shared layout with navigation
```

### Backend API Integration

#### **Upload API** (`/api/upload`)
- **Purpose**: Ingest PDF into Agentic RAG Knowledge Box
- **RAG Integration**: Calls Writer API to index document
- **Security**: User-specific document tagging

#### **Summary API** (`/api/summarize`)
- **Purpose**: Generate document summaries
- **RAG Integration**: Uses Generator Agent for content summarization
- **Output**: Concise 3-5 sentence summaries

#### **Quiz API** (`/api/quiz`)
- **Purpose**: Create interactive quizzes
- **RAG Integration**: Q&A Generator Agent creates MCQs
- **Features**: 5-10 questions with explanations

#### **Question API** (`/api/question`)
- **Purpose**: Answer user questions
- **RAG Integration**: Uses /ask endpoint for contextual responses
- **Features**: Confidence scores and source references

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with SSR/SSG
- **React 18**: Component-based UI library
- **KendoReact**: Professional UI components
- **TailwindCSS**: Utility-first CSS framework

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Formidable**: File upload handling
- **UUID**: Document ID generation

### External Services
- **Agentic RAG**: AI-powered document processing
  - Writer API: Document ingestion
  - Reader API: Document querying  
  - Generator API: Summary creation
  - Q&A Generator API: Quiz generation
  - Ask API: Intelligent Q&A

## 📁 Project Structure

```
studysphere/
├── components/           # Reusable React components
│   └── Layout.js        # Main layout wrapper
├── pages/               # Next.js pages and API routes
│   ├── index.js         # Home page
│   ├── upload.js        # PDF upload page
│   ├── summary.js       # Summary display page
│   ├── quiz.js          # Quiz interface page
│   ├── question.js      # Q&A chat page
│   ├── _app.js          # App configuration
│   └── api/             # Backend API endpoints
│       ├── upload.js    # PDF upload handler
│       ├── summarize.js # Summary generator
│       ├── quiz.js      # Quiz generator
│       └── question.js  # Q&A handler
├── styles/              # CSS and styling
│   └── globals.css      # Global styles with Tailwind
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
├── next.config.js       # Next.js configuration
├── .env.example         # Environment variables template
└── README.md           # This file
```

## 🔒 Security Features

- **User Isolation**: Private Knowledge Boxes per user
- **Document Privacy**: User-specific document tagging
- **API Security**: Bearer token authentication
- **File Validation**: PDF type and size restrictions
- **Error Handling**: Comprehensive error management

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
- Set all `RAG_*` environment variables
- Configure `NEXTAUTH_URL` for your domain
- Add `NEXTAUTH_SECRET` for session security

## 🧪 Testing

### Demo Mode
Run without API keys to test with simulated responses:
```bash
npm run dev
# Upload any PDF to test UI functionality
```

### Full Integration
Configure `.env.local` with real API keys for complete functionality.

## 📊 Performance

- **Client-Side Rendering**: Fast initial loads
- **API Optimization**: Efficient RAG integration
- **File Handling**: Secure PDF processing
- **Responsive Design**: Optimized for all devices

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **Documentation**: Check this README for setup instructions
- **Issues**: Report bugs via GitHub Issues
- **Features**: Request new features via GitHub Discussions

## 🎯 Roadmap

- [ ] **Multi-language Support**: Support for documents in multiple languages
- [ ] **Advanced Analytics**: Detailed learning progress tracking
- [ ] **Collaboration Features**: Share documents and quizzes
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Batch Processing**: Upload multiple documents at once
- [ ] **Custom Themes**: Personalized learning environments

---

**StudySphere** - Transform your documents into interactive learning experiences! 🚀📚