// Copy this file to ai-config.js and include it before script.js in index.html.
// IMPORTANT: Do not commit real API keys to public repositories.
// Preferred production setup: use backendUrl and keep provider keys server-side.

window.PORTFOLIO_AI_CONFIG = {
    // Option 1 (recommended): backend proxy endpoint
    backendUrl: 'http://localhost:3001/api/chat',

    // Option 2: direct provider call from browser (only for local testing)
    // provider: "openai",
    // apiKey: "YOUR_OPENAI_API_KEY",
    // model: "gpt-4o-mini"

    // provider: "gemini",
    // apiKey: "YOUR_GEMINI_API_KEY",
    // model: "gemini-1.5-flash"
};
