# Habla con la Máquina — Technical Specification

## 1. Project Objective

Build a functional, readable, responsive React/Next.js chat interface that sends conversations to a real Groq-hosted AI model through a secure Next.js server route. The application must demonstrate client state management, real API communication, usage accounting, persistence, and clear user feedback without adding features outside the assignment.

## 2. User / Use Case

A user opens the application, writes a question or instruction, and submits it to an AI assistant. The user can read the resulting conversation, continue the same conversation with additional messages, see session token usage and at least one real response metric, reload the page without losing the conversation, and clear the conversation when desired.

## 3. Technical Stack

- Next.js with React.
- React client state managed with `useState`.
- React lifecycle synchronization managed with `useEffect`.
- Browser-to-application communication through the Next.js `/api/chat` route.
- Server-to-Groq communication using the native `fetch` API and `async`/`await`.
- Groq Chat Completions-compatible HTTP API.
- Browser persistence through `localStorage`.
- One configurable `MODEL_ID` value for the selected Groq model.

## 4. Technical Constraints

- The browser must never communicate directly with Groq.
- The Groq API key must be read and used only by server-side code.
- The implementation must use native `fetch` for Groq communication; no Groq SDK, OpenAI SDK, or wrapper library is allowed.
- The Groq request must use `Authorization: Bearer <server-side-key>` and `Content-Type: application/json`.
- `GROQ_API_KEY` must remain server-side only. `NEXT_PUBLIC_GROQ_API_KEY` must never be used.
- Secrets must not appear in browser-visible code, logs, screenshots, or `localStorage`.
- Asynchronous network/API operations must use `async`/`await`; `localStorage` is synchronous and does not require `async`/`await`.
- The design only needs to be functional, readable, and responsive.
- No unnecessary features outside the assignment should be implemented.

## 5. Functional Requirements

- **REQ-001:** The interface MUST provide a text input for composing a user message.
- **REQ-002:** The interface MUST provide a send action that submits the current input.
- **REQ-003:** A non-empty submitted input MUST create a user message in the conversation.
- **REQ-004:** The application MUST send the complete conversation history on every model request, including the newly submitted user message.
- **REQ-005:** User and assistant messages MUST be visually differentiated.
- **REQ-006:** The client MUST use React `useState` for messages, input, loading, and metrics state.
- **REQ-007:** The client MUST use React `useEffect` for localStorage hydration and synchronization.
- **REQ-008:** The client MUST use native `fetch` only when communicating with the application chat route, and the server MUST use native `fetch` only when communicating with Groq.
- **REQ-009:** The implementation MUST NOT use a Groq SDK, OpenAI SDK, or wrapper library.
- **REQ-010:** The server route MUST send the Groq Authorization Bearer header server-side.
- **REQ-011:** JSON requests to Groq and the application route MUST use `Content-Type: application/json`.
- **REQ-012:** `GROQ_API_KEY` MUST remain server-side only, and the implementation MUST NOT define or use `NEXT_PUBLIC_GROQ_API_KEY`.
- **REQ-013:** The browser MUST communicate with Groq through the Next.js `/api/chat` server route.
- **REQ-014:** Asynchronous network/API operations MUST use `async`/`await`; synchronous `localStorage` operations do not require `async`/`await`.
- **REQ-015:** The UI MUST show a loading/thinking state while waiting for Groq.
- **REQ-016:** Non-2xx responses and network failures MUST receive clear user-facing error handling.
- **REQ-017:** The application MUST read `usage.prompt_tokens`, `usage.completion_tokens`, and `usage.total_tokens` from a successful Groq response.
- **REQ-018:** The application MUST accumulate prompt tokens across the current session.
- **REQ-019:** The application MUST accumulate completion tokens across the current session.
- **REQ-020:** The UI MUST display the combined accumulated token total for the current session.
- **REQ-021:** The UI MUST display at least one additional real Groq response metric, such as the returned model name or response time.
- **REQ-022:** The logical chat session, including conversation history and accumulated session metrics needed for a consistent dashboard, MUST be persisted in `localStorage`.
- **REQ-023:** A page reload MUST restore both messages and accumulated session metrics through localStorage hydration.
- **REQ-024:** The UI MUST provide a clearly identifiable “Clear conversation” action.
- **REQ-025:** Clearing the conversation MUST clear both visible messages and all persisted session metrics from localStorage.
- **REQ-026:** The application MUST use one configurable `MODEL_ID` instead of scattering model names through the code.
- **REQ-027:** The visual design MUST be functional, readable, and responsive across supported viewport sizes.
- **REQ-028:** The implementation MUST avoid unnecessary features outside this assignment.
- **REQ-029:** The initial UI/layout starting point MUST be generated with v0.dev and exported or copied into the Next.js project.
- **REQ-030:** A Groq account MUST be available and configured for the project before API integration begins.
- **REQ-031:** A Groq API key MUST be generated for the project.
- **REQ-032:** The generated API key MUST be stored server-side as `GROQ_API_KEY`.
- **REQ-033:** `.env.local` or an equivalent local environment configuration containing the key MUST NOT be committed.
- **REQ-034:** The key configuration MUST be verified with a minimal native-fetch test before application integration begins.
- **REQ-035:** The verification test MUST NOT print, log, or otherwise expose the API key.

## 6. UI Structure

The page should contain:

1. A clear application title and brief context.
2. A conversation area containing message entries in chronological order.
3. Distinct user and assistant message styling, with accessible author labels.
4. A composer area containing the text input and send control.
5. A visible loading/thinking indicator while a request is pending.
6. A metrics area showing accumulated prompt tokens, accumulated completion tokens, combined tokens, and an additional response metric when available.
7. A “Clear conversation” control.
8. A visible, readable error region for recoverable request failures.

The conversation area should remain usable as history grows, and controls should have clear disabled states when actions are unavailable.

## 7. Application State

The client owns UI and session state. At minimum, it must maintain:

- `messages`: the ordered conversation history.
- `input`: the current composer value.
- `loading`: whether a model request is in progress.
- `metrics`: session token accumulators and the latest available real Groq metric.
- A user-facing error value or equivalent state for the latest recoverable failure.

`useState` is the required mechanism for the four specified state categories. `useEffect` hydrates messages and accumulated session metrics on startup and synchronizes the logical session to localStorage. State updates must avoid submitting stale history.

## 8. Data Model

A message contains a role and text content:

```text
Message {
  role: "user" | "assistant"
  content: string
}
```

The UI may use additional non-secret client metadata if needed, but API messages must remain compatible with the expected chat message shape. Metrics should represent numeric prompt, completion, and total token values, plus the latest model and/or response-time value when available. Secrets and authorization headers are never part of any client model or persisted value.

## 9. User Interactions

- The user types into the composer and submits through the send button or an appropriate keyboard action.
- Empty or whitespace-only input is not submitted.
- During a request, the composer and send action should prevent duplicate submissions while the thinking state is visible.
- On success, the assistant message is appended and metrics are updated.
- On failure, the user sees a concise actionable error while the existing conversation remains intact.
- The user can clear the conversation, which resets visible messages, session metrics, and their persisted values.
- The user can reload the page and continue the hydrated conversation with its restored session metrics.

## 10. External API Architecture

The required architecture is:

```text
Browser / React client
        ↓
Next.js /api/chat route
        ↓
Groq API
```

The client owns UI and session state. The server route validates the incoming message list, reads the server-only `GROQ_API_KEY`, applies the single `MODEL_ID`, performs the external Groq request, parses the response, and returns a normalized response to the browser. The browser must not receive the secret or call Groq directly.

### Assignment compatibility note: model name conflict

The source assignment contains conflicting model instructions: one section specifies `qwen/qwen3.6-27b`, while another refers to Llama 3. This conflict is intentionally preserved rather than silently resolved here. The application must use one configurable `MODEL_ID` as its source of truth. The concrete runtime model will be selected during implementation based on the course requirement and current Groq availability. Model identifiers must never be scattered throughout the codebase, and the application must not add multiple model-selection UI features.

## 11. Error States

The application must handle and explain, without exposing secrets:

- Empty or invalid client input.
- Malformed request data.
- Missing server-side API configuration.
- Groq non-2xx responses.
- Application route non-2xx responses.
- Network or fetch failures.
- Unexpected or malformed Groq response data.
- Requests attempted while another request is pending.

Errors should be shown in a visible, accessible user-facing region. Technical credentials, raw authorization values, and sensitive server details must not be displayed.

## 12. Loading States

While awaiting Groq, the UI must show a clear “thinking” or equivalent loading indicator, disable duplicate submission, and preserve the existing conversation. The loading state must always be cleared after success or failure so the interface can recover.

## 13. Token Usage and Metrics

For each successful response, the server/client flow must read `usage.prompt_tokens`, `usage.completion_tokens`, and `usage.total_tokens`. The session must accumulate prompt and completion tokens across requests and display their combined accumulated total. The accumulated metrics needed for a consistent session dashboard must be persisted with the logical chat session and restored after reload. The UI must also show at least one real response metric returned or measured for the Groq response, such as the model name or response time. All persisted metrics must be reset when the conversation/session is cleared.

## 14. Persistence

The logical chat session, including `messages` and accumulated token metrics needed for a consistent dashboard, must be serialized to a dedicated localStorage key and restored on page load. Hydration must handle absent, invalid, or outdated stored data safely. Synchronization must occur after relevant message or metric changes without storing API keys, authorization headers, or other secrets. “Clear conversation” must remove the session key from localStorage and reset the visible conversation and persisted session metrics.

## 15. Responsive Behavior

The layout must work on mobile, tablet, and desktop widths. The composer and controls must remain usable without horizontal scrolling. Message content must wrap safely, and the conversation region must remain readable as messages become longer. Touch targets and spacing should be practical on small screens.

## 16. Accessibility

Use semantic elements and properly associated labels for the composer and controls. Ensure keyboard operation, visible focus indicators, meaningful button text, sufficient contrast, and accessible status/error announcements where appropriate. Loading and error feedback must not rely on color alone. User and assistant roles must be understandable to assistive technology.

## 17. Security

- Keep `GROQ_API_KEY` exclusively in server-side environment/configuration access.
- Never create or use `NEXT_PUBLIC_GROQ_API_KEY`.
- Never send secrets to the browser, source code, logs, screenshots, or localStorage.
- Set the Groq Bearer authorization header only in the server route.
- Validate message roles/content and reasonable request shape at the route boundary.
- Avoid rendering untrusted message content as executable HTML.
- Do not expose raw upstream secrets or unnecessary internal error details in client responses.

## 18. Component Structure

The implementation should separate responsibilities into appropriately focused React components, for example:

- Page or chat screen container.
- Conversation/history component.
- Individual message component.
- Composer/input component.
- Loading/thinking indicator.
- Metrics/status panel.
- Clear-conversation control.

Exact filenames are implementation details. The server-only `/api/chat` route must remain separate from browser components, and secret access must not cross into client bundles.

## 19. API Contract

### `POST /api/chat`

Request body:

```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

Conceptual response body:

```json
{
  "message": { "role": "assistant", "content": "Hello!" },
  "usage": {
    "promptTokens": 10,
    "completionTokens": 8,
    "totalTokens": 18
  },
  "model": "configured-model-id",
  "metrics": {}
}
```

The route accepts `messages: Message[]`, sends the complete history upstream, and returns one normalized assistant `message`, normalized usage values, the configured/returned `model`, and optional additional `metrics`. Success and error HTTP statuses must be meaningful, and error payloads must be safe for display.

## 20. Acceptance Criteria

- **REQ-036:** A user can enter a message and send it through the UI.
- **REQ-037:** User and assistant messages are visibly distinct and ordered correctly.
- **REQ-038:** Each Groq request contains the complete conversation history.
- **REQ-039:** The browser-to-server-to-Groq architecture is enforced, with no client-side secret.
- **REQ-040:** A thinking indicator appears during requests and duplicate sends are prevented.
- **REQ-041:** Non-2xx and network failures produce clear, recoverable user-facing feedback.
- **REQ-042:** Prompt, completion, and total usage values are read, accumulated, persisted, restored after reload, and displayed consistently.
- **REQ-043:** At least one real Groq metric beyond combined tokens is displayed.
- **REQ-044:** The logical chat session, including messages and accumulated metrics, is restored after reload and can be cleared from both UI and localStorage.
- **REQ-045:** The implementation uses one configurable `MODEL_ID`, with the concrete model selected during implementation to resolve the documented assignment conflict.
- **REQ-046:** The interface is readable, keyboard-usable, and responsive on mobile and desktop.
- **REQ-047:** No unnecessary assignment-external feature or prohibited SDK/wrapper is present.

## 21. Out of Scope

- Authentication, accounts, multi-user conversation management, or cloud database storage.
- Streaming responses, voice input/output, file uploads, image generation, or multimodal features.
- Conversation naming, search, export, sharing, branching, or server-side history.
- Advanced prompt management, tool/function calling, agents, or model comparison.
- Production observability, billing dashboards, rate-limit infrastructure, or deployment automation.
- Any feature not required to demonstrate the specified chat, security, metrics, persistence, and responsive UI behavior.

## 22. Implementation Phases

### Phase A — Repository/scaffold

Use v0.dev to generate the initial UI/layout starting point, export or copy that layout into the Next.js/React project, establish the basic page and development configuration, and confirm the project runs. v0 is only the initial layout source; GitHub Copilot with GPT-5.6 Luna remains the main development agent for later implementation.

### Phase B — Groq configuration

Confirm the Groq account, generate the API key, configure it server-side as `GROQ_API_KEY` without committing `.env.local` or equivalent configuration, establish one configurable `MODEL_ID`, and verify the key with a minimal native-fetch test that does not print or expose it. Resolve the documented model-name conflict according to the course requirement and current Groq availability.

### Phase C — Chat UI/state

Build the readable responsive chat layout, message presentation, composer, clear action, loading state, error region, and required `useState` state model.

### Phase D — Real API communication

Implement the Next.js `/api/chat` route and native `fetch` flow to Groq with server-side Bearer authorization, JSON headers, full conversation history, and safe error translation.

### Phase E — Usage metrics

Parse prompt, completion, and total token usage; accumulate session values; and display the combined total plus at least one additional real Groq metric.

### Phase F — Persistence

Add `useEffect`-based localStorage hydration and synchronization for messages and accumulated session metrics, reload recovery, invalid-data handling, and complete clear-conversation cleanup for both messages and metrics.

### Phase G — Final acceptance audit

Check every REQ item, responsive and keyboard behavior, security boundaries, error/loading recovery, API contract, prohibited dependency constraints, and the absence of unnecessary features.
