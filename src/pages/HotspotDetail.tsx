import { useEffect, useState } from 'react';
import type { HotspotDetail, View } from '@/lib/types';
import type { Dict, Lang } from '@/lib/i18n';
import {
  confirmHotspot,
  fetchHotspotDetail,
  getOfficialRef,
  isConfirmedByMe,
  markBriefPrepared,
  photoPublicUrl,
  saveOfficialRef,
} from '@/lib/data';
import { CategoryBadge, StatusBadge, statusIcon } from '@/components/Badges';
import { OfficialHelpLinks } from '@/components/Header';
import { ErrorState, LoadingState } from '@/components/States';
import MapView from '@/components/MapView';
import { fmtDate, fmtDateTime, relativeTime } from '@/lib/format';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  FileText,
  Flag,
  ImageOff,
  MapPin,
  Phone,
  ThumbsUp,
  History,
  Sparkles,
  AlertTriangle,
  Save,
  ShieldAlert,
} from 'lucide-react';

interface DetailProps {
  t: Dict;
  lang: Lang;
  hotspotId: string;
  onNavigate: (v: View) => void;
  onSelectHotspot: (id: string) => void;
}

export default function HotspotDetail({
  t,
  lang,
  hotspotId,
  onNavigate,
}: DetailProps) {
  const [detail, setDetail] = useState<HotspotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [refValue, setRefValue] = useState('');
  const [refSaved, setRefSaved] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchHotspotDetail(hotspotId)
      .then((d) => setDetail(d))
      .catch((e) => setError(e instanceof Error ? e.message : t.common.error))
      .finally(() => setLoading(false));
  };

  useEffect(load, [hotspotId, t]);

  useEffect(() => {
    setRefValue(getOfficialRef(hotspotId));
    setConfirmMsg(null);
  }, [hotspotId]);

  if (loading) return <LoadingState t={t} />;
  if (error) return <ErrorState t={t} message={error} onRetry={load} />;
  if (!detail)
    return <ErrorState t={t} message={t.home.noHotspots} onRetry={() => onNavigate('home')} />;

  const sortedReports = [...detail.reports].sort((a, b) =>
    a.observed_at.localeCompare(b.observed_at),
  );
  const photos = sortedReports
    .map((r) => ({ r, url: photoPublicUrl(r.photo_path) }))
    .filter((x) => x.url);
  const confirmedByMe = isConfirmedByMe(hotspotId, detail.confirmations);
  const cleanupReports = sortedReports.filter((r) => r.is_cleanup);
  const lastCleanup = cleanupReports.at(-1);
  const recurrenceReports = lastCleanup
    ? sortedReports.filter((r) => !r.is_cleanup && r.observed_at > lastCleanup.observed_at)
    : [];

  async function onConfirm() {
    setConfirming(true);
    setConfirmMsg(null);
    try {
      const { alreadyConfirmed } = await confirmHotspot(hotspotId);
      if (alreadyConfirmed) setConfirmMsg(t.detail.alreadyConfirmed);
      else setConfirmMsg(t.detail.confirm);
      load();
    } catch (e) {
      setConfirmMsg(t.detail.confirmError);
    } finally {
      setConfirming(false);
    }
  }

  async function onPrepareBrief() {
    await markBriefPrepared(hotspotId);
    onNavigate('brief');
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
      <button onClick={() => onNavigate('home')} className="btn-ghost mb-4 -ms-2">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t.detail.back}
      </button>

      {detail.is_demo && (
        <div className="mb-4 rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-700 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{t.detail.demoBanner}</span>
        </div>
      )}

      {/* Header card */}
      <div className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <CategoryBadge category={detail.category} t={t} />
          <StatusBadge status={detail.status} t={t} />
          {detail.is_demo && (
            <span className="badge bg-coral-50 text-coral-700 border border-coral-200">
              {t.home.demoLabel}
            </span>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-ink">{detail.title}</h1>
        <p className="mt-2 text-ink-soft flex items-center gap-1.5 text-sm">
          <MapPin className="h-4 w-4 shrink-0" />
          {detail.location_label}
        </p>

        {/* Map */}
        <div className="mt-4 card overflow-hidden h-56 sm:h-64">
          <MapView
            hotspots={[detail]}
            center={[detail.lat, detail.lng]}
            className="h-full w-full"
          />
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat
            icon={<Flag className="h-4 w-4" />}
            label={t.detail.reportCount}
            value={String(detail.reports.length)}
          />
          <Stat
            icon={<ThumbsUp className="h-4 w-4" />}
            label={t.home.confirmations}
            value={String(detail.confirmations.length)}
          />
          <Stat
            icon={<Calendar className="h-4 w-4" />}
            label={t.detail.firstObserved}
            value={fmtDate(sortedReports[0]?.observed_at ?? detail.created_at, lang)}
          />
          <Stat
            icon={<Calendar className="h-4 w-4" />}
            label={t.detail.latestObserved}
            value={fmtDate(sortedReports.at(-1)?.observed_at ?? detail.created_at, lang)}
          />
        </div>

        {/* Confirm */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={onConfirm}
            disabled={confirming || confirmedByMe}
            className={confirmedByMe ? 'btn-secondary' : 'btn-primary'}
          >
            {confirmedByMe ? (
              <>
                <Check className="h-4 w-4" /> {t.detail.alreadyConfirmed}
              </>
            ) : (
              <>
                <ThumbsUp className="h-4 w-4" />
                {confirming ? t.detail.confirming : t.detail.confirm}
              </>
            )}
          </button>
          <span className="text-sm text-ink-muted">
            {detail.confirmations.length} {t.home.confirmations}
          </span>
          {confirmMsg && (
            <span className="text-sm text-forest-700 inline-flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> {confirmMsg}
            </span>
          )}
        </div>
      </div>

      {/* Recurrence banner */}
      {recurrenceReports.length > 0 && (
        <div className="mt-4 rounded-xl bg-coral-50 border border-coral-200 px-4 py-3 text-sm text-coral-700 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            {t.statuses.recurring}: {recurrenceReports.length}{' '}
            {t.home.observations} {t.detail.timeline.toLowerCase()}.
          </span>
        </div>
      )}

      {/* Observations */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Flag className="h-4 w-4 text-forest-600" />
          {t.detail.observations} ({detail.reports.length})
        </h2>
        <ul className="space-y-3">
          {sortedReports.map((r) => (
            <li key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-ink-muted inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {fmtDateTime(r.observed_at, lang)}
                    </span>
                    {r.is_cleanup && (
                      <span className="badge bg-sky-50 text-sky-700 border border-sky-200">
                        <Sparkles className="h-3 w-3" /> {t.statuses.cleanup_observed}
                      </span>
                    )}
                    {r.is_demo && (
                      <span className="badge bg-coral-50 text-coral-700 border border-coral-200">
                        {t.home.demoLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink">{r.description}</p>
                  {r.photo_path && photoPublicUrl(r.photo_path) && (
                    <a
                      href={photoPublicUrl(r.photo_path) as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block"
                    >
                      <img
                        src={photoPublicUrl(r.photo_path) as string}
                        alt=""
                        className="h-24 rounded-lg border border-sand-200 object-cover"
                      />
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Evidence gallery */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-forest-600" />
          {t.detail.evidence}
        </h2>
        {photos.length === 0 ? (
          <div className="card p-6 text-center text-sm text-ink-muted flex flex-col items-center gap-2">
            <ImageOff className="h-6 w-6" />
            {t.detail.noPhotos}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {photos.map(({ r, url }) => (
              <a
                key={r.id}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="card overflow-hidden group"
              >
                <img
                  src={url as string}
                  alt=""
                  className="h-28 w-full object-cover group-hover:opacity-90 transition"
                />
                <p className="p-2 text-[11px] text-ink-muted">
                  {fmtDate(r.observed_at, lang)}
                </p>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-forest-600" />
          {t.detail.timeline}
        </h2>
        <ol className="relative border-s-2 border-sand-100 ms-2 space-y-4 ps-5">
          {[...detail.events]
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
            .map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -start-[26px] top-1 grid h-5 w-5 place-items-center rounded-full bg-forest-100 text-forest-700 ring-2 ring-canvas">
                  {e.to_status ? statusIcon(e.to_status) : <Flag className="h-3 w-3" />}
                </span>
                <div className="card p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink">{e.detail}</span>
                    <span className="text-[11px] text-ink-muted shrink-0">
                      {relativeTime(e.created_at, lang)}
                    </span>
                  </div>
                  {e.from_status && e.to_status && (
                    <p className="text-xs text-ink-muted mt-1">
                      {t.statuses[e.from_status]} → {t.statuses[e.to_status]}
                    </p>
                  )}
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {fmtDateTime(e.created_at, lang)}
                  </p>
                </div>
              </li>
            ))}
        </ol>
      </section>

      {/* Action brief + official handoff */}
      <section className="mt-6 card p-5">
        <h2 className="text-lg font-semibold mb-1">{t.detail.prepareBrief}</h2>
        <p className="text-sm text-ink-muted mb-3">{t.brief.subtitle}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={onPrepareBrief} className="btn-primary">
            <FileText className="h-4 w-4" /> {t.detail.prepareBrief}
          </button>
          <OfficialHelpLinks t={t} />
        </div>

        {/* Official ref recorder */}
        <div className="rounded-xl border border-sand-200 bg-sand-100/40 p-3">
          <label className="field-label" htmlFor="ref">
            {t.detail.officialRef}
          </label>
          <div className="flex gap-2">
            <input
              id="ref"
              type="text"
              value={refValue}
              onChange={(e) => {
                setRefValue(e.target.value);
                setRefSaved(false);
              }}
              placeholder={t.detail.officialRefPlaceholder}
              className="field-input"
            />
            <button
              onClick={() => {
                saveOfficialRef(hotspotId, refValue.trim());
                setRefSaved(true);
              }}
              className="btn-secondary shrink-0"
            >
              <Save className="h-4 w-4" /> {t.detail.saveRef}
            </button>
          </div>
          {refSaved && (
            <p className="mt-1.5 text-sm text-forest-700 inline-flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> {t.detail.refSaved}
            </p>
          )}
          <p className="mt-1.5 text-xs text-ink-muted flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {t.brief.officialHandoffBody}
          </p>
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-sand-100/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-ink-muted text-xs">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-semibold text-ink text-sm">{value}</p>
    </div>
  );
}
