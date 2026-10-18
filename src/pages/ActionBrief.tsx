import { useEffect, useMemo, useState } from 'react';
import type { View } from '@/lib/types';
import type { Dict, Lang } from '@/lib/i18n';
import {
  fetchHotspotDetail,
  getOfficialRef,
  markBriefPrepared,
  photoPublicUrl,
} from '@/lib/data';
import { CategoryBadge, StatusBadge } from '@/components/Badges';
import { OfficialHelpLinks } from '@/components/Header';
import { ErrorState, LoadingState } from '@/components/States';
import { buildBriefText, downloadTextFile, fmtDate, fmtDateTime } from '@/lib/format';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  MapPin,
  Printer,
  ShieldAlert,
  Users,
} from 'lucide-react';

interface BriefProps {
  t: Dict;
  lang: Lang;
  hotspotId: string;
  onNavigate: (v: View) => void;
}

export default function ActionBrief({ t, lang, hotspotId, onNavigate }: BriefProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchHotspotDetail>> | null>(null);
  const [officialRef, setOfficialRef] = useState('');
  const [copied, setCopied] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchHotspotDetail(hotspotId)
      .then((d) => {
        setDetail(d);
        if (d) {
          markBriefPrepared(hotspotId).catch(() => {});
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : t.common.error))
      .finally(() => setLoading(false));
  };

  useEffect(load, [hotspotId, t]);

  useEffect(() => {
    setOfficialRef(getOfficialRef(hotspotId));
  }, [hotspotId]);

  const briefText = useMemo(() => {
    if (!detail) return '';
    return buildBriefText(
      t,
      {
        title: detail.title,
        category: detail.category,
        location_label: detail.location_label,
        status: detail.status,
        reports: detail.reports.map((r) => ({
          observed_at: r.observed_at,
          description: r.description,
          is_cleanup: r.is_cleanup,
        })),
        confirmations: detail.confirmations,
        events: detail.events.map((e) => ({
          event_type: e.event_type,
          detail: e.detail,
          created_at: e.created_at,
        })),
      },
      officialRef,
    );
  }, [detail, t, officialRef]);

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

  function onCopy() {
    navigator.clipboard
      .writeText(briefText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  function onPrint() {
    window.print();
  }

  function onDownload() {
    if (!detail) return;
    const safe = (detail.title || 'saafspot-brief')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    downloadTextFile(`${safe}.txt`, briefText);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
      <div className="no-print">
        <button
          onClick={() => onNavigate('detail')}
          className="btn-ghost mb-4 -ms-2"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t.brief.back}
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-forest-600" />
            {t.brief.title}
          </h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={onCopy} className="btn-secondary">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? t.brief.copied : t.brief.copy}
            </button>
            <button onClick={onDownload} className="btn-secondary">
              <Download className="h-4 w-4" /> {t.brief.download}
            </button>
            <button onClick={onPrint} className="btn-primary">
              <Printer className="h-4 w-4" /> {t.brief.print}
            </button>
          </div>
        </div>
        <p className="text-sm text-ink-muted mb-5">{t.brief.subtitle}</p>
      </div>

      {/* Printable area */}
      <article className="print-area card p-6 sm:p-8 space-y-6">
        <header className="border-b border-sand-100 pb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wide text-forest-700 font-semibold">
                {t.appName}
              </p>
              <h2 className="text-xl font-bold mt-0.5">{detail.title}</h2>
            </div>
            <span className="text-xs text-ink-muted">
              {t.brief.generatedAt}: {fmtDateTime(new Date().toISOString(), lang)}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <CategoryBadge category={detail.category} t={t} />
            <StatusBadge status={detail.status} t={t} />
            {detail.is_demo && (
              <span className="badge bg-coral-50 text-coral-700 border border-coral-200">
                {t.home.demoLabel}
              </span>
            )}
          </div>
        </header>

        <Section title={t.brief.location}>
          <p className="text-sm text-ink flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-forest-600" />
            {detail.location_label}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            {detail.lat.toFixed(5)}, {detail.lng.toFixed(5)}
          </p>
        </Section>

        <Section title={t.brief.summary}>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Def label={t.brief.firstObserved}>
              {fmtDate(sortedReports[0]?.observed_at ?? detail.created_at, lang)}
            </Def>
            <Def label={t.brief.latestObserved}>
              {fmtDate(sortedReports.at(-1)?.observed_at ?? detail.created_at, lang)}
            </Def>
            <Def label={t.brief.observations}>
              {detail.reports.length}
            </Def>
            <Def label={t.brief.confirmations}>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {detail.confirmations.length}
              </span>
            </Def>
          </dl>
        </Section>

        <Section title={`${t.brief.observations} (${detail.reports.length})`}>
          <ol className="space-y-2 text-sm">
            {sortedReports.map((r, i) => (
              <li key={r.id} className="flex gap-3">
                <span className="text-ink-muted tabular-nums shrink-0">{i + 1}.</span>
                <span>
                  <span className="text-xs text-ink-muted me-2">
                    [{fmtDate(r.observed_at, lang)}]
                    {r.is_cleanup ? ` (${t.statuses.cleanup_observed})` : ''}
                  </span>
                  <span className="text-ink">{r.description}</span>
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title={t.brief.evidence}>
          {photos.length === 0 ? (
            <p className="text-sm text-ink-muted">{t.brief.noEvidence}</p>
          ) : (
            <>
              <p className="text-sm text-ink-soft mb-2">
                {photos.length} {t.brief.evidenceItems}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photos.map(({ r, url }, i) => (
                  <figure key={r.id} className="rounded-lg overflow-hidden border border-sand-200">
                    <img src={url as string} alt="" className="h-20 w-full object-cover" />
                    <figcaption className="p-1.5 text-[10px] text-ink-muted">
                      #{i + 1} · {fmtDate(r.observed_at, lang)}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </>
          )}
        </Section>

        <Section title={t.brief.timeline}>
          <ol className="space-y-1.5 text-sm">
            {[...detail.events]
              .sort((a, b) => a.created_at.localeCompare(b.created_at))
              .map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="text-xs text-ink-muted tabular-nums shrink-0 w-28">
                    {fmtDate(e.created_at, lang)}
                  </span>
                  <span className="text-ink">{e.detail}</span>
                </li>
              ))}
          </ol>
        </Section>

        <Section title={t.brief.recommendedAction}>
          <p className="text-sm text-ink-soft">{t.brief.recommendedActionBody}</p>
          <div className="mt-3 no-print">
            <OfficialHelpLinks t={t} />
          </div>
        </Section>

        {officialRef && (
          <Section title={t.brief.referenceLabel}>
            <p className="text-sm font-mono bg-sand-100/60 rounded-lg px-3 py-2 inline-block">
              {officialRef}
            </p>
          </Section>
        )}

        <footer className="border-t border-sand-100 pt-4 text-xs text-ink-muted flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{t.brief.disclaimer}</span>
        </footer>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-ink mb-2">{title}</h3>
      {children}
    </section>
  );
}

function Def({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink mt-0.5">{children}</dd>
    </div>
  );
}
