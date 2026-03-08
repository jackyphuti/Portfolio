import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();

function buildSystemPrompt(context = {}) {
  return [
    "You are Ask Jacky Bot for Jacky Mpoka's portfolio website.",
    'Be concise, friendly, and professional.',
    'Answer only with information grounded in the supplied context.',
    'If something is unknown, say so and suggest contacting Jacky directly.',
    `Context: ${JSON.stringify(context)}`
  ].join(' ');
}

async function askOpenAI(question, context) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        { role: 'user', content: question }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || 'No response generated.';
}

async function askGemini(question, context) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${buildSystemPrompt(context)} Question: ${question}` }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No response generated.';
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', provider });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { question, context } = req.body || {};

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'question is required' });
    }

    let answer;
    if (provider === 'gemini') {
      answer = await askGemini(question, context);
    } else {
      answer = await askOpenAI(question, context);
    }

    return res.json({ answer });
  } catch (error) {
    return res.status(500).json({
      error: 'AI request failed',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Portfolio chatbot backend running at http://localhost:${port}`);
  console.log(`AI provider: ${provider}`);
});
