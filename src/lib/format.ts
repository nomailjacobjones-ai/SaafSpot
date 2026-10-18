import type { Category, Status } from './types';
import type { Dict } from './i18n';

export function fmtDate(iso: string, lang: 'en' | 'ur'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === 'ur' ? 'ur-PK' : 'en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function fmtDateTime(iso: string, lang: 'en' | 'ur'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(lang === 'ur' ? 'ur-PK' : 'en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function relativeTime(iso: string, lang: 'en' | 'ur'): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const day = 86400000;
  const hr = 3600000;
  const min = 60000;
  const en = (v: number, unit: string) => `${v} ${unit}${v === 1 ? '' : 's'} ago`;
  if (lang === 'ur') {
    if (diff < min) return 'ابھی ابھی';
    if (diff < hr) return `${Math.round(diff / min)} منٹ پہلے`;
    if (diff < day) return `${Math.round(diff / hr)} گھنٹے پہلے`;
    return `${Math.round(diff / day)} دن پہلے`;
  }
  if (diff < min) return 'just now';
  if (diff < hr) return en(Math.round(diff / min), 'minute');
  if (diff < day) return en(Math.round(diff / hr), 'hour');
  return en(Math.round(diff / day), 'day');
}

export function categoryColor(c: Category): string {
  switch (c) {
    case 'overflowing_bin':
      return 'bg-coral-50 text-coral-700 border-coral-200';
    case 'uncollected_waste':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'illegal_dumping':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'missing_damaged_bin':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-sand-100 text-ink-soft border-sand-200';
  }
}

export function statusColor(s: Status): string {
  switch (s) {
    case 'reported':
      return 'bg-sand-100 text-ink-soft border-sand-200';
    case 'corroborated':
      return 'bg-forest-50 text-forest-700 border-forest-200';
    case 'brief_prepared':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'cleanup_observed':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'recurring':
      return 'bg-coral-50 text-coral-700 border-coral-200';
    default:
      return 'bg-sand-100 text-ink-soft border-sand-200';
  }
}

export function statusIconKey(s: Status): string {
  return s;
}

export function buildBriefText(
  t: Dict,
  detail: {
    title: string;
    category: Category;
    location_label: string;
    status: Status;
    reports: { observed_at: string; description: string; is_cleanup: boolean }[];
    confirmations: { id: string }[];
    events: { event_type: string; detail: string; created_at: string }[];
  },
  officialRef: string,
): string {
  const L = t.brief;
  const lines: string[] = [];
  lines.push(`${t.appName} — ${L.title}`);
  lines.push('='.repeat(48));
  lines.push(`${L.caseTitle}: ${detail.title}`);
  lines.push(`${L.category}: ${t.categories[detail.category]}`);
  lines.push(`${L.location}: ${detail.location_label}`);
  lines.push(`${L.status}: ${t.statuses[detail.status]}`);
  lines.push('');
  const sorted = [...detail.reports].sort((a, b) =>
    a.observed_at.localeCompare(b.observed_at),
  );
  lines.push(`${L.observations} (${sorted.length}):`);
  sorted.forEach((r, i) => {
    lines.push(
      `  ${i + 1}. [${fmtDate(r.observed_at, 'en')}]${r.is_cleanup ? ' (cleanup)' : ''} ${r.description}`,
    );
  });
  lines.push('');
  lines.push(`${L.firstObserved}: ${fmtDate(sorted[0]?.observed_at ?? '', 'en')}`);
  lines.push(`${L.latestObserved}: ${fmtDate(sorted.at(-1)?.observed_at ?? '', 'en')}`);
  lines.push(`${L.confirmations}: ${detail.confirmations.length}`);
  lines.push('');
  lines.push(`${L.timeline}:`);
  detail.events.forEach((e) => {
    lines.push(`  - [${fmtDate(e.created_at, 'en')}] ${e.detail}`);
  });
  lines.push('');
  lines.push(`${L.recommendedAction}:`);
  lines.push(`  ${L.recommendedActionBody}`);
  lines.push('');
  lines.push(`${L.officialHandoff}:`);
  lines.push(`  ${L.officialHandoffBody}`);
  lines.push(`  Suthra Punjab: https://suthra.punjab.gov.pk/complaint.php`);
  lines.push(`  Helpline: 1139`);
  if (officialRef) {
    lines.push(`  ${L.referenceLabel}: ${officialRef}`);
  }
  lines.push('');
  lines.push(L.disclaimer);
  lines.push(`${L.generatedAt}: ${fmtDateTime(new Date().toISOString(), 'en')}`);
  return lines.join('\n');
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
