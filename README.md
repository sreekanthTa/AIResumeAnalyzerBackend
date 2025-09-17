Test
backend
# AIResumeAnalyzerBackend

AIResumeAnalyzerBackend is a backend service for intelligent resume analysis, rewriting, and job matching, built primarily in JavaScript using Node.js and Express. It leverages modern AI and NLP tools such as LangChain, OpenAI, Pinecone, and Xenova for embeddings and conversational intelligence.

## Features

- **Resume Analysis:**  
  Upload a resume and a job description to receive detailed feedback and suggestions for improvement. The backend analyzes content structure, matches skills, and provides actionable recommendations.
- **Resume Rewriting:**  
  Automatically rewrite sections of a resume for improved clarity, relevance, and impact based on the target job description.
- **Conversational AI:**  
  Engage in chat-based interactions about resume content, job fit, and interview preparation using custom AI models.
- **Starter Code Generation:**  
  Generates starter code skeletons for coding problems in various programming languages, with only the function/class signature and TODO comments.
- **Embeddings & Search:**  
  Uses HuggingFace and Xenova models for embeddings and Pinecone for semantic search, enabling advanced matching and information retrieval.
- **Question Management:**  
  Supports creation, updating, searching, and embedding of interview questions or job-related queries.
- **Authentication:**  
  Secure user authentication with JWT tokens, session management, and password handling.

## Main Technologies

- **Node.js & Express:** REST API server.
- **LangChain & OpenAI:** Conversational AI and chat logic.
- **Pinecone & Embedding Models:** Fast, scalable vector search for resumes and questions.
- **Xenova:** Local and cloud-hosted embedding generation.
- **Multer:** File upload handling for resumes.
- **JWT, bcrypt:** User authentication and security.

## API Endpoints

- `POST /api/resume/analyze` — Analyze a resume and job description.
- `POST /api/resume/rewrite` — Rewrite resume content.
- `POST /api/resume/chat` — AI-powered chat about resume/job fit.
- `POST /api/resume/questions` — Generate questions based on job description.
- `POST /api/auth/signin` — User authentication.
- `POST /api/questions/` — Manage and search interview questions.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sreekanthTa/AIResumeAnalyzerBackend.git
   cd AIResumeAnalyzerBackend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**  
   Create a `.env` file with required keys (see sample below).
4. **Run the server:**
   ```bash
   npm start
   ```
   The server runs on `http://localhost:5000` by default.

## Environment Variables (.env Example)

```
PORT=5000
JWT_SECRET=your_jwt_secret
HUGGING_FACE_API_KEY=your_huggingface_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index
FRONTEND_ORIGIN=http://localhost:3000
```

## Folder Structure

- `src/app.js` — Application entry point
- `src/server.js` — Server setup and DB connection
- `src/routes/` — API routes (resume, auth, questions)
- `src/service/` — Core services (AI, embeddings, Pinecone, authentication)
- `src/controllers/` — Request handlers

## License

This project is for educational and research purposes. License to be defined.
