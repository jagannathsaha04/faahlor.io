'use client';

interface Props {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl text-sm"
      style={{
        background: 'rgba(248, 113, 113, 0.12)',
        border: '1px solid rgba(248, 113, 113, 0.3)',
        color: '#fca5a5',
      }}
    >
      <span className="leading-relaxed">{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="shrink-0 text-lg leading-none transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
        style={{ opacity: 0.7 }}
      >
        ×
      </button>
    </div>
  );
}
