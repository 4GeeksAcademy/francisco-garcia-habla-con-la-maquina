"use client"

import { useEffect, useState, type ReactNode } from 'react'
import styles from './page.module.css'
import type { ChatApiResponse, Message, Metrics } from '../types/chat'
import { ChatMessage } from '../components/chat/ChatMessage'
import { ChatComposer } from '../components/chat/ChatComposer'
import { MetricsPanel } from '../components/chat/MetricsPanel'

type IconName = 'sparkles' | 'user' | 'bot' | 'code' | 'rotate' | 'arrow' | 'clock' | 'alert'

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    sparkles: <><path d="m12 3-1.1 4.2L7 8.5l3.9 1.3L12 14l1.1-4.2L17 8.5l-3.9-1.3L12 3Z" /><path d="m19 14-.6 2.4L16 17l2.4.6L19 20l.6-2.4L22 17l-2.4-.6L19 14Z" /></>,
    user: <><circle cx="12" cy="8" r="3" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
    bot: <><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8" /></>,
    code: <><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 6l-4 12" /></>,
    rotate: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></>,
    arrow: <><path d="M12 19V5M6 11l6-6 6 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

const initialMetrics: Metrics = { promptTokens: 0, completionTokens: 0, totalTokens: 0, model: null, responseTime: null }
const STORAGE_KEY = 'habla-con-la-maquina:session:v1'

type PersistedSession = {
  version: 1;
  messages: Message[];
  metrics: Metrics;
}

function isPersistedSession(value: unknown): value is PersistedSession {
  if (typeof value !== 'object' || value === null) return false
  const session = value as Record<string, unknown>
  if (session.version !== 1 || !Array.isArray(session.messages) || typeof session.metrics !== 'object' || session.metrics === null) return false

  const messagesValid = session.messages.every((message) => {
    if (typeof message !== 'object' || message === null) return false
    const candidate = message as Record<string, unknown>
    return (candidate.role === 'user' || candidate.role === 'assistant') && typeof candidate.content === 'string' && candidate.content.trim().length > 0
  })
  if (!messagesValid) return false

  const metrics = session.metrics as Record<string, unknown>
  const isNonNegativeNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0
  return isNonNegativeNumber(metrics.promptTokens) && isNonNegativeNumber(metrics.completionTokens) && isNonNegativeNumber(metrics.totalTokens)
    && (typeof metrics.model === 'string' || metrics.model === null)
    && (metrics.responseTime === null || isNonNegativeNumber(metrics.responseTime))
}

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics)
  const [error, setError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (stored !== null) {
          const parsed: unknown = JSON.parse(stored)
          if (isPersistedSession(parsed)) {
            setMessages(parsed.messages)
            setMetrics(parsed.metrics)
          } else {
            window.localStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      } finally {
        setHydrated(true)
      }
    })
  }, [])

  useEffect(() => {
    if (!hydrated) return

    const isEmptySession = messages.length === 0
      && metrics.promptTokens === 0
      && metrics.completionTokens === 0
      && metrics.totalTokens === 0
      && metrics.model === null
      && metrics.responseTime === null

    if (isEmptySession) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    const session: PersistedSession = { version: 1, messages, metrics }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [hydrated, messages, metrics])

  async function submitMessage() {
    if (loading) return
    const content = input.trim()
    if (!content) { setError('Escribe un mensaje antes de enviar.'); return }
    const nextMessages = [...messages, { role: 'user' as const, content }]
    setMessages(nextMessages)
    setInput('')
    setError(null)
    setLoading(true)
    const startedAt = performance.now()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const data: unknown = await response.json()
      if (!response.ok) {
        const message = typeof data === 'object' && data !== null && typeof (data as { error?: unknown }).error === 'string'
          ? (data as { error: string }).error
          : 'No se pudo obtener una respuesta del asistente.'
        throw new Error(message)
      }
      const chatResponse = data as ChatApiResponse
      setMessages((current) => [...current, chatResponse.message])
      const responseTime = Math.round(performance.now() - startedAt)
      setMetrics((current) => ({
        ...current,
        promptTokens: current.promptTokens + chatResponse.usage.promptTokens,
        completionTokens: current.completionTokens + chatResponse.usage.completionTokens,
        totalTokens: current.totalTokens + chatResponse.usage.totalTokens,
        model: chatResponse.model,
        responseTime,
      }))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo obtener una respuesta del asistente.')
    } finally {
      setLoading(false)
    }
  }

  function clearConversation() {
    setMessages([]); setInput(''); setLoading(false); setError(null); setMetrics(initialMetrics)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  return <main className={styles.page}><div className={styles.shell}>
    <section className={styles.chatSection}><header className={styles.header}><div className={styles.brand}><div className={styles.brandIcon}><Icon name="sparkles" /></div><div><p className={styles.kicker}>PROYECTO 01 / PROTOTIPO</p><h1 className={styles.title}>Habla con la Máquina</h1><p className={styles.subtitle}>Una interfaz de chat conectada a una API de IA real.</p></div></div><div className={styles.online}><span className={styles.dot} /> En línea</div></header>
      <div className={styles.conversation}><div className={styles.messages} aria-live="polite"><div className={styles.messageList}>{messages.length === 0 ? <div className={styles.info}><span className={styles.codeIcon}><Icon name="code" size={14} /></span><span>Escribe un mensaje para comenzar una conversación.</span></div> : messages.map((message, index) => <ChatMessage key={`${message.role}-${index}`} message={message} />)}{loading && <p className={styles.loading} role="status">Pensando...</p>}</div></div><ChatComposer input={input} loading={loading} onInputChange={(value) => { setInput(value); if (value.trim()) setError(null) }} onSubmit={submitMessage} onClear={clearConversation} /></div>
    </section><MetricsPanel metrics={metrics} error={error} loading={loading} />
  </div></main>
}
