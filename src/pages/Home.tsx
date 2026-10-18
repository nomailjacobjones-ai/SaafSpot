import { useMemo, useState } from 'react';
import type { Category, Hotspot, Status, View } from '@/lib/types';
import type { Dict, Lang } from '@/lib/i18n';
import { CATEGORIES, STATUSES } from '@/lib/types';
import { fmtDate, relativeTime, categoryColor, statusColor } from '@/lib/format';
import { CategoryBadge, StatusBadge, categoryIcon, statusIcon } from '@/components/Badges';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import MapView from '@/components/MapView';
import { LAHORE_CENTER, ACTIVE_STATUSES } from '@/lib/demoData';
import {
  Map as MapIcon,
  List,
  Search,
  Plus,
  Trash2,
  Waves,
  Truck,
  Ban,
  CircleAlert,
  Flag,
  Users,
  FileText,
  Sparkles,
  RotateCcw,
  ChevronRight,
  MapPin,
  Eye,
  ThumbsUp,
} from 'lucide-react';

interface HomeProps {
  t: Dict;
  lang: Lang;
  hotspots: Hotspot[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNavigate: (v: View) => void;
  onSelectHotspot: (id: string) => void;
  demoMode: boolean;
  reportCounts: Record<string, number>;
  confirmationCounts: Record<string, number>;
}

type Filter = 'all' | 'active' | 'demo' | 'real';

export default function Home({
  t,
  lang,
  hotspots,
  loading,
  error,
  onRetry,
  onNavigate,
  onSelectHotspot,
  demoMode,
  reportCounts,
  confirmationCounts,
}: HomeProps) {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    return hotspots.filter((h) => {
      if (category !== 'all' && h.category !== category) return false;
      if (status !== 'all' && h.status !== status) return false;
      if (filter === 'active' && !ACTIVE_STATUSES.includes(h.status)) return false;
      if (filter === 'demo' && !h.is_demo) return false;
      if (filter === 'real' && h.is_demo) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !h.title.toLowerCase().includes(q) &&
          !h.location_label.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [hotspots, category, status, filter, search]);

  const counts = useMemo(() => {
    const real = hotspots.filter((h) => !h.is_demo);
    const demo = hotspots.filter((h) => h.is_demo);
    const activeReal = real.filter((h) => ACTIVE_STATUSES.includes(h.status));
    const corroborated = hotspots.filter((h) => h.status === 'corroborated' || h.status === 'recurring');
    const cleanups = hotspots.filter((h) => h.status === 'cleanup_observed');
    const totalReports = Object.values(reportCounts).reduce((a, b) => a + b, 0);
    return {
      totalReal: real.length,
      totalDemo: demo.length,
      activeReal: activeReal.length,
      corroborated: corroborated.length,
      cleanups: cleanups.length,
      totalReports,
    };
  }, [hotspots, reportCounts]);

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 py-6 sm:py-8">
      {/* Hero */}
      <section className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-ink leading-tight max-w-2xl">
          {t.home.title}
        </h1>
        <p className="mt-3 text-ink-soft max-w-2xl text-sm sm:text-base">
          {t.home.subtitle}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => onNavigate('new')} className="btn-primary">
            <Plus className="h-4 w-4" />
            {t.home.reportCta}
          </button>
          <button onClick={() => onNavigate('about')} className="btn-secondary">
            {t.nav.about}
          </button>
        </div>
      </section>

      {/* Live counts */}
      <section className="mb-6 sm:mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <CountCard
          icon={<Flag className="h-5 w-5" />}
          value={counts.totalReal}
          label={t.home.hotspots}
          sub={
            demoMode
              ? `${counts.totalDemo} ${t.home.countsDemo}`
              : `${counts.totalDemo} ${t.home.countsDemo}`
          }
          tone="forest"
          demo={demoMode}
          t={t}
        />
        <CountCard
          icon={<Users className="h-5 w-5" />}
          value={counts.corroborated}
          label={t.statuses.corroborated}
          tone="forest"
          t={t}
        />
        <CountCard
          icon={<RotateCcw className="h-5 w-5" />}
          value={hotspots.filter((h) => h.status === 'recurring').length}
          label={t.statuses.recurring}
          tone="coral"
          t={t}
        />
        <CountCard
          icon={<Sparkles className="h-5 w-5" />}
          value={counts.cleanups}
          label={t.statuses.cleanup_observed}
          tone="sky"
          t={t}
        />
      </section>

      {/* Filters */}
      <section className="mb-4 card p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.home.search}
              className="field-input ps-9"
              aria-label={t.home.search}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | 'all')}
              className="field-input w-auto py-2"
              aria-label={t.home.allCategories}
            >
              <option value="all">{t.home.allCategories}</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t.categories[c]}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status | 'all')}
              className="field-input w-auto py-2"
              aria-label={t.home.allStatuses}
            >
              <option value="all">{t.home.allStatuses}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t.statuses[s]}
                </option>
              ))}
            </select>
            <div className="flex gap-1.5 ms-auto">
              {(['all', 'active', 'real', 'demo'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`chip text-xs px-2.5 py-1.5 ${
                    filter === f ? 'chip-active' : ''
                  }`}
                >
                  {f === 'all'
                    ? lang === 'ur' ? 'تمام' : 'All'
                    : f === 'active'
                      ? lang === 'ur' ? 'فعال' : 'Active'
                      : f === 'real'
                        ? t.home.realLabel
                        : t.home.demoLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* View toggle */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.home.hotspots}</h2>
        <div className="inline-flex rounded-xl border border-sand-200 bg-white p-1">
          <button
            onClick={() => setView('list')}
            className={`btn px-3 py-1.5 text-xs ${view === 'list' ? 'bg-forest-600 text-white' : 'text-ink-soft'}`}
            aria-pressed={view === 'list'}
          >
            <List className="h-3.5 w-3.5" /> {t.home.list}
          </button>
          <button
            onClick={() => setView('map')}
            className={`btn px-3 py-1.5 text-xs ${view === 'map' ? 'bg-forest-600 text-white' : 'text-ink-soft'}`}
            aria-pressed={view === 'map'}
          >
            <MapIcon className="h-3.5 w-3.5" /> {t.home.map}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState t={t} />
      ) : error ? (
        <ErrorState t={t} message={error} onRetry={onRetry} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t.home.noHotspots}
          hint={t.home.noHotspotsHint}
          action={
            <button onClick={() => onNavigate('new')} className="btn-primary">
              <Plus className="h-4 w-4" /> {t.home.reportCta}
            </button>
          }
        />
      ) : view === 'list' ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((h) => (
            <li key={h.id}>
              <HotspotCard
                h={h}
                t={t}
                lang={lang}
                reports={reportCounts[h.id] ?? 0}
                confirmations={confirmationCounts[h.id] ?? 0}
                onClick={() => onSelectHotspot(h.id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card overflow-hidden h-[420px] sm:h-[520px]">
          <MapView
            hotspots={filtered}
            center={[LAHORE_CENTER.lat, LAHORE_CENTER.lng]}
            onMarkerClick={onSelectHotspot}
            className="h-full w-full"
          />
        </div>
      )}
    </div>
  );
}

function CountCard({
  icon,
  value,
  label,
  sub,
  tone,
  demo,
  t,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  sub?: string;
  tone: 'forest' | 'coral' | 'sky';
  demo?: boolean;
  t: Dict;
}) {
  const tones = {
    forest: 'bg-forest-50 text-forest-700',
    coral: 'bg-coral-50 text-coral-700',
    sky: 'bg-sky-50 text-sky-700',
  };
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tones[tone]}`}>
          {icon}
        </span>
        <span className="text-2xl font-bold text-ink tabular-nums">{value}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-ink-soft">{label}</p>
      {sub && (
        <p className="text-[11px] text-ink-muted mt-0.5">
          {demo && tone === 'forest' ? `${t.common.demoMode}: ` : ''}
          {sub}
        </p>
      )}
    </div>
  );
}

function HotspotCard({
  h,
  t,
  lang,
  reports,
  confirmations,
  onClick,
}: {
  h: Hotspot;
  t: Dict;
  lang: Lang;
  reports: number;
  confirmations: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card w-full text-start p-4 hover:shadow-pop hover:border-forest-200 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <CategoryBadge category={h.category} t={t} />
            <StatusBadge status={h.status} t={t} />
            {h.is_demo && (
              <span className="badge bg-coral-50 text-coral-700 border border-coral-200">
                {t.home.demoLabel}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-ink truncate group-hover:text-forest-700">
            {h.title}
          </h3>
          <p className="mt-1 text-sm text-ink-muted truncate flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {h.location_label}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-ink-muted group-hover:text-forest-600 mt-1 shrink-0 rtl:rotate-180" />
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          {reports} {t.home.observations}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ThumbsUp className="h-3.5 w-3.5" />
          {confirmations} {t.home.confirmations}
        </span>
        <span className="ms-auto">
          {relativeTime(h.updated_at, lang)}
        </span>
      </div>
    </button>
  );
}
