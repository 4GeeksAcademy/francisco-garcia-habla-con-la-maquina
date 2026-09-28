# Habla con la Máquina

A responsive Next.js chat interface connected to a real Groq AI API through a secure server route.

## Features

- Real Groq API communication
- Next.js `/api/chat` server route
- Complete multi-turn conversation history
- Loading and recoverable error states
- Prompt, completion, and total token accounting
- Accumulated session metrics
- Returned model display
- Real response-time measurement
- `localStorage` conversation persistence
- Reload recovery
- Clear-conversation behavior
- Responsive UI
- Keyboard controls, including Enter to send and Shift + Enter for a new line

## Architecture

```text
Browser / React
        ↓
Next.js /api/chat
        ↓
Groq API
```

The browser sends the conversation to the Next.js `/api/chat` route. The server route validates the request and communicates with Groq using the server-side `GROQ_API_KEY`. The API key never reaches the browser or localStorage.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- CSS Modules
- Native `fetch`
- Groq Chat Completions API
- Browser `localStorage`

## Environment

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

Set the server-side configuration in `.env.local`:

```text
GROQ_API_KEY=
MODEL_ID=qwen/qwen3.8-27b
```

Keep `.env.local` private. It is ignored by Git and must never be committed.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open the local URL shown by Next.js in your browser.

## Validation

Run the project checks with:

```bash
npm run lint
npm run build
npx tsc --noEmit
```

## Project Requirements / Important Behavior

- Every model request includes the complete conversation history, including the newly submitted user message.
- Prompt, completion, and total token usage accumulates after each successful API call.
- Persisted messages and metrics survive a page reload through a versioned localStorage session.
- Clear conversation resets the visible chat and removes the persisted session.
- Input, loading state, errors, API keys, authorization headers, and environment values are not persisted.

## Repository

[4GeeksAcademy/francisco-garcia-habla-con-la-maquina](https://github.com/4GeeksAcademy/francisco-garcia-habla-con-la-maquina)
