# 📚 StudySphere - AI-Powered Learning Platform

StudySphere is a complete Next.js application that transforms PDF documents into interactive learning experiences using **Agentic RAG** (Retrieval-Augmented Generation). Upload your PDFs and unlock AI-powered summaries, intelligent quizzes, and contextual Q&A - all powered by private knowledge boxes for secure, personalized learning.

## Features

- **PDF Upload**: Upload PDF documents to be processed and stored in RAG system
- **AI Summary**: Generate concise summaries of uploaded PDFs
- **Interactive Quiz**: Take AI-generated multiple-choice quizzes based on PDF content
- **Q&A Chat**: Ask questions about your PDFs and get AI-powered answers

## Tech Stack

- **Frontend**: Next.js 14, React 18, KendoReact, TailwindCSS
- **Backend**: Next.js API Routes
- **AI Integration**: Anthropic Claude AI, Agentic RAG
- **Styling**: TailwindCSS with KendoReact components

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the `.env.local` file and fill in your API keys:

```bash
cp .env.local .env.local.example  # For reference
```

Edit `.env.local` with your actual keys:

- **ANTHROPIC_API_KEY**: Get from [Anthropic Console](https://console.anthropic.com/)
- **RAG_WRITER_KEY** & **RAG_READER_KEY**: Obtain from your Agentic RAG provider

For MVP testing, you can leave RAG keys empty - the app will simulate responses.

### 3. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload PDF**: Go to `/upload` and select a PDF file to upload
2. **View Summary**: Navigate to `/summary` to see AI-generated summary
3. **Take Quiz**: Visit `/quiz` for interactive multiple-choice questions
4. **Ask Questions**: Use `/question` for chat-like Q&A about your PDF

## API Endpoints

- `POST /api/upload` - Upload PDF and store in RAG
- `POST /api/summarize` - Generate PDF summary
- `POST /api/quiz` - Generate quiz questions
- `POST /api/question` - Answer user questions

## Example PDF

For testing, you can use any PDF document. The app processes PDFs up to 10MB in size.

## Project Structure

```
studysphere/
├── pages/
│   ├── _app.js              # App wrapper
│   ├── index.js             # Home page
│   ├── upload.js            # PDF upload page
│   ├── summary.js           # Summary display page
│   ├── quiz.js              # Quiz page
│   ├── question.js          # Q&A page
│   └── api/
│       ├── upload.js        # Upload API
│       ├── summarize.js     # Summary API
│       ├── quiz.js          # Quiz API
│       └── question.js      # Question API
├── styles/
│   └── globals.css          # Global styles
├── .env.local               # Environment variables
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind config
├── postcss.config.js        # PostCSS config
└── next.config.js           # Next.js config
```

## Development Notes

- The app uses a simple user ID system (hardcoded as 'user1' for MVP)
- API keys are securely stored in environment variables
- RAG integration supports user-specific knowledge boxes
- Claude AI prompts are optimized for educational content

## License

MIT License
