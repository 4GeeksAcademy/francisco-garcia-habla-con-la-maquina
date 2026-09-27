import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import styles from "../../app/page.module.css";

type ChatComposerProps = {
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export function ChatComposer({ input, loading, onInputChange, onSubmit, onClear }: ChatComposerProps) {
  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onInputChange(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <div className={styles.composerInner}>
        <div className={styles.composerHeader}>
          <label className={styles.label} htmlFor="message">Tu mensaje</label>
          <button className={styles.clear} type="button" onClick={onClear} disabled={loading}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
            </svg>
            Limpiar conversación
          </button>
        </div>
        <div className={styles.inputBox}>
          <textarea
            className={styles.textarea}
            id="message"
            rows={2}
            placeholder="Escribe tu mensaje aquí..."
            aria-label="Mensaje para el asistente"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className={styles.send} type="submit" aria-label="Enviar mensaje" disabled={loading}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </button>
        </div>
        <p className={styles.hint}>Presiona Enter para enviar · Shift + Enter para una nueva línea</p>
      </div>
    </form>
  );
}
