import type { ReactNode } from 'react'
import styles from './page.module.css'

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

const metrics = [
  { label: 'Prompt Tokens', value: '0' }, { label: 'Completion Tokens', value: '0' },
  { label: 'Total Tokens', value: '0' }, { label: 'Model', value: '—' }, { label: 'Response Time', value: '—' },
]

export default function Page() {
  return <main className={styles.page}><div className={styles.shell}>
    <section className={styles.chatSection}><header className={styles.header}><div className={styles.brand}><div className={styles.brandIcon}><Icon name="sparkles" /></div><div><p className={styles.kicker}>PROYECTO 01 / PROTOTIPO</p><h1 className={styles.title}>Habla con la Máquina</h1><p className={styles.subtitle}>Una interfaz de chat conectada a una API de IA real.</p></div></div><div className={styles.online}><span className={styles.dot} /> En línea</div></header>
      <div className={styles.conversation}><div className={styles.messages}><div className={styles.messageList}><div className={styles.message}><div className={styles.userIcon}><Icon name="user" size={16} /></div><div className={styles.messageBody}><p className={styles.messageMeta}>Tú · 10:42</p><div className={styles.bubble}>¿Puedes explicarme cómo funciona una API de IA?</div></div></div><div className={styles.message}><div className={styles.botIcon}><Icon name="bot" size={16} /></div><div className={styles.messageBody}><p className={`${styles.messageMeta} ${styles.assistantMeta}`}>Asistente · 10:42</p><div className={`${styles.bubble} ${styles.assistantBubble}`}>Claro. Una API de IA permite que una aplicación envíe instrucciones a un modelo y reciba una respuesta generada. En este prototipo, el mensaje viajará desde este chat hasta el servicio de IA y volverá aquí.</div></div></div><div className={styles.info}><span className={styles.codeIcon}><Icon name="code" size={14} /></span><span>Escribe un mensaje para comenzar una conversación.</span></div></div></div>
        <div className={styles.composer}><div className={styles.composerInner}><div className={styles.composerHeader}><label className={styles.label} htmlFor="message">Tu mensaje</label><button className={styles.clear} type="button"><Icon name="rotate" size={14} /> Limpiar conversación</button></div><div className={styles.inputBox}><textarea className={styles.textarea} id="message" rows={2} placeholder="Escribe tu mensaje aquí..." aria-label="Mensaje para el asistente" /><button className={styles.send} type="button" aria-label="Enviar mensaje"><Icon name="arrow" size={20} /></button></div><p className={styles.hint}>Presiona Enter para enviar · Shift + Enter para una nueva línea</p></div></div></div>
    </section><aside className={styles.sidebar}><div className={styles.sidebarInner}><div className={styles.sidebarHeading}><div><p className={`${styles.kicker} ${styles.label}`}>Datos de sesión</p><h2 className={styles.sidebarTitle}>Métricas</h2></div><div className={styles.clockIcon}><Icon name="clock" size={16} /></div></div><div className={styles.metrics}>{metrics.map((metric, index) => <div className={`${styles.metric} ${index === 2 ? styles.metricWide : ''}`} key={metric.label}><p className={styles.metricLabel}>{metric.label}</p><p className={styles.metricValue}>{metric.value}</p></div>)}</div><div className={styles.errorBox}><div className={styles.errorContent}><Icon name="alert" size={16} /><div><p className={styles.errorTitle}>Área de errores</p><p className={styles.errorText}>Los mensajes de error de la API aparecerán aquí.</p></div></div></div><div className={styles.status}><p className={styles.label}>Estado actual</p><p className={styles.statusText}><span className={styles.statusDot} /> Esperando tu mensaje</p></div></div></aside>
  </div></main>
}
