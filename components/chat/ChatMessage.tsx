import type { Message } from "../../types/chat";
import styles from "../../app/page.module.css";

type ChatMessageProps = {
  message: Message;
};

function MessageIcon({ role }: { role: Message["role"] }) {
  return role === "user" ? (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  ) : (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M12 3v4M8 12h.01M16 12h.01M8 16h8" />
    </svg>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <article className={styles.message} aria-label={isUser ? "Mensaje del usuario" : "Mensaje del asistente"}>
      <div className={isUser ? styles.userIcon : styles.botIcon}>
        <MessageIcon role={message.role} />
      </div>
      <div className={styles.messageBody}>
        <p className={`${styles.messageMeta} ${isUser ? "" : styles.assistantMeta}`}>
          {isUser ? "Tú" : "Asistente"}
        </p>
        <div className={`${styles.bubble} ${isUser ? "" : styles.assistantBubble}`}>{message.content}</div>
      </div>
    </article>
  );
}
