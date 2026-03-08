# Portfolio Chat Backend

Small Express API that keeps AI provider keys private while powering the portfolio chatbot.

## 1) Install

```bash
cd backend
npm install
```

## 2) Configure

Copy `.env.example` to `.env` and set values:

- `AI_PROVIDER=openai` or `AI_PROVIDER=gemini`
- `OPENAI_API_KEY` or `GEMINI_API_KEY`

## 3) Run

```bash
npm run dev
```

Server starts on `http://localhost:3001` by default.

## Endpoints

- `GET /api/health`
- `POST /api/chat`

Request body:

```json
{
  "question": "What are Jacky's career goals?",
  "context": {}
}
```

Response:

```json
{
  "answer": "..."
}
```

## Frontend integration

In `ai-config.js` use:

```js
window.PORTFOLIO_AI_CONFIG = {
  backendUrl: "http://localhost:3001/api/chat"
};
```

For production, deploy this backend and update `backendUrl` accordingly.
