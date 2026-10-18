import { Loader2 } from 'lucide-react';
import type { Dict } from '@/lib/i18n';

export function LoadingState({ t, label }: { t: Dict; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-muted">
      <Loader2 className="h-7 w-7 animate-spin text-forest-500" aria-hidden />
      <p className="text-sm">{label ?? t.common.loading}</p>
    </div>
  );
}

export function ErrorState({
  t,
  message,
  onRetry,
}: {
  t: Dict;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-sm text-coral-700">{message ?? t.common.error}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          {t.common.retry}
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-sm font-medium text-ink-soft">{title}</p>
      {hint && <p className="text-sm text-ink-muted max-w-sm">{hint}</p>}
      {action}
    </div>
  );
}
