import { NextResponse } from "next/server";
import type { Message } from "../../../types/chat";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

function isMessage(value: unknown): value is Message {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (candidate.role === "user" || candidate.role === "assistant")
    && typeof candidate.content === "string"
    && candidate.content.trim().length > 0;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud debe contener JSON válido." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !Array.isArray((body as Record<string, unknown>).messages)) {
    return NextResponse.json({ error: "La solicitud debe incluir una conversación válida." }, { status: 400 });
  }

  const messages = (body as { messages: unknown[] }).messages;
  if (messages.length === 0 || !messages.every(isMessage)) {
    return NextResponse.json({ error: "La conversación contiene mensajes inválidos." }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const modelId = process.env.MODEL_ID;
  if (!apiKey || !modelId) {
    return NextResponse.json({ error: "La configuración del servidor no está disponible." }, { status: 500 });
  }

  try {
    const upstream = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: modelId, messages }),
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "No se pudo obtener una respuesta del asistente." }, { status: 502 });
    }

    const data: unknown = await upstream.json();
    const record = typeof data === "object" && data !== null ? data as Record<string, unknown> : null;
    const choices = record?.choices;
    const choice = Array.isArray(choices) ? choices[0] : null;
    const assistant = typeof choice === "object" && choice !== null ? (choice as Record<string, unknown>).message : null;
    const content = typeof assistant === "object" && assistant !== null ? (assistant as Record<string, unknown>).content : null;
    const usage = record?.usage;
    const usageRecord = typeof usage === "object" && usage !== null ? usage as Record<string, unknown> : null;

    if (typeof content !== "string" || content.trim().length === 0 || usageRecord === null) {
      return NextResponse.json({ error: "La respuesta del asistente no tiene un formato válido." }, { status: 502 });
    }

    const promptTokens = usageRecord.prompt_tokens;
    const completionTokens = usageRecord.completion_tokens;
    const totalTokens = usageRecord.total_tokens;
    if (typeof promptTokens !== "number" || typeof completionTokens !== "number" || typeof totalTokens !== "number") {
      return NextResponse.json({ error: "La respuesta del asistente no tiene un formato válido." }, { status: 502 });
    }

    return NextResponse.json({
      message: { role: "assistant", content },
      usage: { promptTokens, completionTokens, totalTokens },
      model: typeof record?.model === "string" ? record.model : modelId,
    });
  } catch {
    return NextResponse.json({ error: "No se pudo obtener una respuesta del asistente." }, { status: 502 });
  }
}