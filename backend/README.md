# AI Chat Backend

A production-ready Node.js + Express backend with a local offline AI model, PDF upload, and context-aware chat.

---

## Stack

| Layer       | Technology                       |
|-------------|----------------------------------|
| Runtime     | Node.js (ES Modules)             |
| Framework   | Express.js                       |
| AI (local)  | Ollama / LM Studio / llama.cpp   |
| PDF parsing | pdf-parse + multer               |
| Config      | dotenv                           |
| Dev server  | nodemon                          |

---

## Project Structure

```
ai-chat-backend/
├── server.js                        # Entry point
├── .env.example                     # Copy to .env
├── uploads/                         # Temp PDF storage (auto-created)
└── src/
    ├── controllers/
    │   ├── chat.controller.js       # Handles /api/chat requests
    │   └── pdf.controller.js        # Handles /api/upload requests
    ├── routes/
    │   ├── chat.routes.js
    │   └── pdf.routes.js
    ├── services/
    │   ├── chat.service.js          # Conversation memory + prompt building
    │   ├── pdf.service.js           # PDF parsing + in-memory storage
    │   └── adapters/
    │       ├── rest.adapter.js      # Talks to Ollama / LM Studio / llama.cpp
    │       └── mock.adapter.js      # Canned responses for testing
    ├── middlewares/
    │   ├── error.middleware.js      # Global error handler
    │   ├── logger.middleware.js     # HTTP request logger
    │   ├── notFound.middleware.js   # 404 handler
    │   ├── validate.middleware.js   # Input validation
    │   └── upload.middleware.js     # Multer PDF config
    └── utils/
        ├── logger.util.js           # Console logger with colours
        └── error.util.js            # createError() factory
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`. The only required choice is `AI_MODE`:

| Mode   | When to use                                         |
|--------|-----------------------------------------------------|
| `mock` | No model needed — great for testing the API         |
| `rest` | You have Ollama, LM Studio, or llama.cpp running    |

### 3. (Optional) Start a local model

**Ollama** (recommended — easiest setup):
```bash
# Install: https://ollama.com
ollama pull phi3        # Download the Phi-3 model (~2 GB)
ollama serve            # Starts REST API on http://localhost:11434
```

**LM Studio**:
- Download from https://lmstudio.ai
- Load any model and start the local server on port 1234
- Set `AI_REST_URL=http://localhost:1234` in `.env`

**llama.cpp HTTP server**:
```bash
./server -m models/phi-3.gguf --port 8080
# Set AI_REST_URL=http://localhost:8080 in .env
```

### 4. Start the backend

```bash
# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

---

## API Reference

### Health Check

```
GET /health
```
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": "42s",
  "model": "phi3",
  "mode": "rest"
}
```

---

### Send a Chat Message

```
POST /api/chat
Content-Type: application/json

{ "message": "What is the capital of France?" }
```

**Response:**
```json
{
  "success": true,
  "reply": "The capital of France is Paris.",
  "historyLength": 2,
  "model": "phi3"
}
```

**Notes:**
- Conversation history is kept in memory (last `CONTEXT_WINDOW` messages).
- If a PDF is uploaded, its text is automatically included in the AI's context.

---

### Clear Conversation History

```
DELETE /api/chat/history
```
```json
{ "success": true, "message": "Conversation history cleared." }
```

---

### Upload a PDF

```
POST /api/upload
Content-Type: multipart/form-data

file: <your-file.pdf>
```

**Response:**
```json
{
  "success": true,
  "message": "PDF uploaded and parsed successfully.",
  "filename": "report.pdf",
  "charCount": 12400,
  "pageCount": 5,
  "preview": "First 300 characters of extracted text..."
}
```

After uploading, all chat messages will include the PDF content as context.

---

### Check PDF Status

```
GET /api/pdf/status
```
```json
{
  "loaded": true,
  "filename": "report.pdf",
  "charCount": 12400,
  "pageCount": 5,
  "preview": "..."
}
```

---

### Clear PDF Context

```
DELETE /api/pdf
```
```json
{ "success": true, "message": "PDF context cleared." }
```

---

## Example Workflows

### Chat only (mock mode)

```bash
# 1. Start server
AI_MODE=mock npm run dev

# 2. Send a message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

### Chat with PDF (Ollama)

```bash
# 1. Start Ollama
ollama serve

# 2. Start server
AI_MODE=rest AI_MODEL_NAME=phi3 npm run dev

# 3. Upload a PDF
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/document.pdf"

# 4. Ask a question about it
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Summarise the main points of the document."}'
```

---

## Environment Variables Reference

| Variable             | Default                      | Description                                      |
|----------------------|------------------------------|--------------------------------------------------|
| `PORT`               | `3000`                       | HTTP port                                        |
| `NODE_ENV`           | `development`                | `development` or `production`                    |
| `AI_MODE`            | `mock`                       | `mock` or `rest`                                 |
| `AI_REST_URL`        | `http://localhost:11434`     | Base URL of local model server                   |
| `AI_MODEL_NAME`      | `phi3`                       | Model name to request from the server            |
| `CONTEXT_WINDOW`     | `6`                          | Number of past messages included in each prompt  |
| `PDF_MAX_SIZE_BYTES` | `10485760` (10 MB)           | Maximum PDF upload size                          |
| `UPLOAD_DIR`         | `uploads`                    | Temporary folder for uploaded files              |

---

## Adding a New AI Backend

1. Create `src/services/adapters/your-adapter.js`
2. Export `async function callYourModel(systemPrompt, messages)`
3. Add a new `case` in `chat.service.js → callModel()`
4. Set `AI_MODE=your-mode` in `.env`

That's it — nothing else needs to change.
