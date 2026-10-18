import { useMemo, useRef, useState } from 'react';
import type { Category, Hotspot, NewReportDraft, View } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import type { Dict, Lang } from '@/lib/i18n';
import { CategoryBadge } from '@/components/Badges';
import { LocationPicker } from '@/components/MapView';
import { LAHORE_CENTER } from '@/lib/demoData';
import { findDuplicateCandidates } from '@/lib/duplicate';
import { createReport } from '@/lib/data';
import { fileToDataUrl, fmtDateTime } from '@/lib/format';
import {
  ArrowLeft,
  CheckCircle2,
  Crosshair,
  ImagePlus,
  Link2,
  MapPin,
  PlusCircle,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

interface NewReportProps {
  t: Dict;
  lang: Lang;
  hotspots: Hotspot[];
  onNavigate: (v: View) => void;
  onSelectHotspot: (id: string) => void;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/jpg'];

type Errors = Partial<
  Record<'category' | 'location_label' | 'coords' | 'observed_at' | 'description' | 'photo' | 'root', string>
>;

function validate(draft: NewReportDraft, t: Dict): Errors {
  const e: Errors = {};
  if (!draft.category) e.category = t.newReport.errors.category;
  if (draft.location_label.trim().length < 3)
    e.location_label = t.newReport.errors.locationLabel;
  const lat = parseFloat(draft.lat);
  const lng = parseFloat(draft.lng);
  if (Number.isNaN(lat) || lat < -90 || lat > 90 || Number.isNaN(lng) || lng < -180 || lng > 180)
    e.coords = t.newReport.errors.coords;
  if (!draft.observed_at) e.observed_at = t.newReport.errors.observedAt;
  else if (new Date(draft.observed_at) > new Date())
    e.observed_at = t.newReport.errors.futureDate;
  if (draft.description.trim().length < 10)
    e.description = t.newReport.errors.description;
  return e;
}

const emptyDraft: NewReportDraft = {
  category: '',
  location_label: '',
  lat: '',
  lng: '',
  observed_at: '',
  description: '',
  photo: null,
  is_cleanup: false,
};

export default function NewReport({
  t,
  lang,
  hotspots,
  onNavigate,
  onSelectHotspot,
}: NewReportProps) {
  const [draft, setDraft] = useState<NewReportDraft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachChoice, setAttachChoice] = useState<string | 'new' | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const candidates = useMemo(() => {
    if (!draft.category) return [];
    const lat = parseFloat(draft.lat);
    const lng = parseFloat(draft.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return [];
    return findDuplicateCandidates(
      draft.category as Category,
      lat,
      lng,
      draft.location_label,
      hotspots,
    );
  }, [draft.category, draft.lat, draft.lng, draft.location_label, hotspots]);

  const lat = parseFloat(draft.lat);
  const lng = parseFloat(draft.lng);
  const pickerValue = !Number.isNaN(lat) && !Number.isNaN(lng) ? { lat, lng } : null;

  function update<K extends keyof NewReportDraft>(key: K, value: NewReportDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationError(t.newReport.locationDenied);
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update('lat', pos.coords.latitude.toFixed(6));
        update('lng', pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      () => {
        setLocationError(t.newReport.locationDenied);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function handlePhoto(file: File | null) {
    if (!file) {
      update('photo', null);
      setPreviewUrl(null);
      return;
    }
    if (!ACCEPTED.includes(file.type) || file.size > MAX_PHOTO_BYTES) {
      setErrors((e) => ({ ...e, photo: t.newReport.photoError }));
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setErrors((e) => ({ ...e, photo: undefined }));
    update('photo', file);
    fileToDataUrl(file).then(setPreviewUrl).catch(() => setPreviewUrl(null));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eMap = validate(draft, t);
    setErrors(eMap);
    if (Object.keys(eMap).length > 0) {
      setShowPreview(false);
      return;
    }
    setShowPreview(true);
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await createReport({
        category: draft.category as Category,
        location_label: draft.location_label.trim(),
        lat: parseFloat(draft.lat),
        lng: parseFloat(draft.lng),
        observed_at: new Date(draft.observed_at).toISOString(),
        description: draft.description.trim(),
        is_cleanup: draft.is_cleanup,
        photo: draft.photo,
        attachToHotspotId:
          attachChoice && attachChoice !== 'new' ? attachChoice : undefined,
      });
      setSubmittedId(result.hotspot_id);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedId) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <div className="card p-6 sm:p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-forest-600 mx-auto" />
          <h2 className="mt-4 text-xl font-bold">{t.newReport.success}</h2>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button onClick={() => onSelectHotspot(submittedId)} className="btn-primary">
              {t.home.viewDetails}
            </button>
            <button
              onClick={() => {
                setDraft(emptyDraft);
                setPreviewUrl(null);
                setShowPreview(false);
                setAttachChoice(null);
                setSubmittedId(null);
              }}
              className="btn-secondary"
            >
              {t.nav.newReport}
            </button>
            <button onClick={() => onNavigate('home')} className="btn-ghost">
              {t.nav.home}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
      <button onClick={() => onNavigate('home')} className="btn-ghost mb-4 -ms-2">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t.common.back}
      </button>
      <h1 className="text-2xl sm:text-3xl font-bold">{t.newReport.title}</h1>
      <p className="mt-2 text-ink-soft text-sm sm:text-base">{t.newReport.subtitle}</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
        {/* Category */}
        <div>
          <label className="field-label" htmlFor="category">
            {t.newReport.category}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => update('category', c)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-start transition ${
                  draft.category === c
                    ? 'border-forest-500 bg-forest-50 text-forest-700'
                    : 'border-sand-200 bg-white text-ink-soft hover:border-forest-300'
                }`}
                aria-pressed={draft.category === c}
              >
                <CategoryBadge category={c} t={t} />
              </button>
            ))}
          </div>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>

        {/* Location label */}
        <div>
          <label className="field-label" htmlFor="location_label">
            {t.newReport.locationLabel}
          </label>
          <input
            id="location_label"
            type="text"
            value={draft.location_label}
            onChange={(e) => update('location_label', e.target.value)}
            placeholder={t.newReport.locationPlaceholder}
            className="field-input"
            aria-invalid={!!errors.location_label}
          />
          <p className="mt-1.5 text-xs text-ink-muted">{t.newReport.locationHint}</p>
          {errors.location_label && <p className="field-error">{errors.location_label}</p>}
        </div>

        {/* Coordinates */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-ink-soft">
              {t.newReport.coordinates}
            </span>
            <button
              type="button"
              onClick={useMyLocation}
              className="btn-ghost py-1.5 px-2.5 text-xs"
              disabled={locating}
            >
              <Crosshair className="h-3.5 w-3.5" />
              {locating ? t.newReport.locating : t.newReport.useMyLocation}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="sr-only" htmlFor="lat">{t.newReport.lat}</label>
              <input
                id="lat"
                type="number"
                step="any"
                value={draft.lat}
                onChange={(e) => update('lat', e.target.value)}
                placeholder={t.newReport.lat}
                className="field-input"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="lng">{t.newReport.lng}</label>
              <input
                id="lng"
                type="number"
                step="any"
                value={draft.lng}
                onChange={(e) => update('lng', e.target.value)}
                placeholder={t.newReport.lng}
                className="field-input"
              />
            </div>
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">{t.newReport.coordsHint}</p>
          {locationError && <p className="field-error">{locationError}</p>}
          {errors.coords && <p className="field-error">{errors.coords}</p>}
          <div className="mt-3 card overflow-hidden h-48 sm:h-56">
            <LocationPicker
              value={pickerValue}
              onChange={(la, ln) => {
                update('lat', la.toFixed(6));
                update('lng', ln.toFixed(6));
              }}
              center={[LAHORE_CENTER.lat, LAHORE_CENTER.lng]}
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Observed at */}
        <div>
          <label className="field-label" htmlFor="observed_at">
            {t.newReport.observedAt}
          </label>
          <input
            id="observed_at"
            type="datetime-local"
            value={draft.observed_at}
            onChange={(e) => update('observed_at', e.target.value)}
            max={new Date().toISOString().slice(0, 16)}
            className="field-input"
            aria-invalid={!!errors.observed_at}
          />
          {errors.observed_at && <p className="field-error">{errors.observed_at}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="field-label" htmlFor="description">
            {t.newReport.description}
          </label>
          <textarea
            id="description"
            value={draft.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder={t.newReport.descriptionPlaceholder}
            rows={4}
            className="field-input resize-y"
            aria-invalid={!!errors.description}
          />
          {errors.description && <p className="field-error">{errors.description}</p>}
        </div>

        {/* Photo */}
        <div>
          <label className="field-label">{t.newReport.photo}</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
            className="hidden"
            id="photo"
          />
          {previewUrl ? (
            <div className="relative mt-1 rounded-xl overflow-hidden border border-sand-200">
              <img src={previewUrl} alt="Preview" className="max-h-64 w-full object-cover" />
              <button
                type="button"
                onClick={() => handlePhoto(null)}
                className="absolute top-2 end-2 rounded-full bg-black/60 text-white p-1.5"
                aria-label={t.common.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="photo"
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sand-200 bg-white py-8 cursor-pointer hover:border-forest-300 hover:bg-forest-50/40 transition"
            >
              <ImagePlus className="h-7 w-7 text-ink-muted" />
              <span className="text-sm text-ink-soft">
                <Upload className="inline h-3.5 w-3.5 me-1" />
                {t.newReport.photo}
              </span>
            </label>
          )}
          <p className="mt-1.5 text-xs text-ink-muted">{t.newReport.photoHint}</p>
          {errors.photo && <p className="field-error">{errors.photo}</p>}
        </div>

        {/* Is cleanup */}
        <label className="flex items-start gap-3 rounded-xl border border-sand-200 bg-white p-3.5 cursor-pointer hover:border-forest-300">
          <input
            type="checkbox"
            checked={draft.is_cleanup}
            onChange={(e) => update('is_cleanup', e.target.checked)}
            className="mt-1 h-4 w-4 accent-forest-600"
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <Sparkles className="h-4 w-4 text-sky-600" />
              {t.newReport.isCleanup}
            </span>
            <span className="block text-xs text-ink-muted mt-0.5">
              {t.newReport.isCleanupHint}
            </span>
          </span>
        </label>

        {submitError && (
          <div className="rounded-xl bg-coral-50 border border-coral-200 text-coral-700 px-4 py-3 text-sm">
            {submitError}
          </div>
        )}

        <button type="submit" className="btn-primary w-full sm:w-auto">
          <PlusCircle className="h-4 w-4" />
          {t.newReport.preview}
        </button>
      </form>

      {/* Preview + duplicate choice modal */}
      {showPreview && (
        <PreviewModal
          t={t}
          draft={draft}
          previewUrl={previewUrl}
          candidates={candidates}
          attachChoice={attachChoice}
          setAttachChoice={setAttachChoice}
          submitting={submitting}
          onCancel={() => setShowPreview(false)}
          onSubmit={submit}
          onSelectHotspot={(id) => {
            setShowPreview(false);
            onSelectHotspot(id);
          }}
        />
      )}
    </div>
  );
}

function PreviewModal({
  t,
  draft,
  previewUrl,
  candidates,
  attachChoice,
  setAttachChoice,
  submitting,
  onCancel,
  onSubmit,
  onSelectHotspot,
}: {
  t: Dict;
  draft: NewReportDraft;
  previewUrl: string | null;
  candidates: ReturnType<typeof findDuplicateCandidates>;
  attachChoice: string | 'new' | null;
  setAttachChoice: (v: string | 'new' | null) => void;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  onSelectHotspot: (id: string) => void;
}) {
  const canSubmit =
    attachChoice !== null && (attachChoice === 'new' || attachChoice.length > 0);
  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-surface w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-pop">
        <div className="sticky top-0 bg-surface border-b border-sand-100 px-5 py-3 flex items-center justify-between">
          <h2 className="font-semibold">{t.newReport.preview}</h2>
          <button onClick={onCancel} className="btn-ghost p-1.5" aria-label={t.common.close}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-ink-muted">{t.newReport.previewHint}</p>

          <dl className="space-y-2 text-sm">
            <PreviewRow label={t.newReport.category}>
              <CategoryBadge category={draft.category as Category} t={t} />
            </PreviewRow>
            <PreviewRow label={t.newReport.locationLabel}>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {draft.location_label}
              </span>
            </PreviewRow>
            <PreviewRow label={t.newReport.coordinates}>
              {draft.lat}, {draft.lng}
            </PreviewRow>
            <PreviewRow label={t.newReport.observedAt}>
              {draft.observed_at ? fmtDateTime(new Date(draft.observed_at).toISOString(), 'en') : '—'}
            </PreviewRow>
            <PreviewRow label={t.newReport.description}>
              <span className="text-ink-soft">{draft.description}</span>
            </PreviewRow>
            {draft.is_cleanup && (
              <PreviewRow label={t.newReport.isCleanup}>
                <Sparkles className="h-4 w-4 text-sky-600 inline me-1" />
                {t.newReport.isCleanup}
              </PreviewRow>
            )}
            {previewUrl && (
              <PreviewRow label={t.newReport.photo}>
                <img src={previewUrl} alt="Preview" className="max-h-40 rounded-lg" />
              </PreviewRow>
            )}
          </dl>

          {/* Duplicate handling */}
          <div className="rounded-xl border border-sand-200 bg-sand-100/40 p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Link2 className="h-4 w-4 text-forest-600" />
              {t.newReport.duplicateTitle}
            </h3>
            <p className="text-xs text-ink-muted mt-1">{t.newReport.duplicateHint}</p>
            <div className="mt-3 space-y-2">
              {candidates.length === 0 ? (
                <p className="text-sm text-ink-soft">{t.newReport.duplicateNone}</p>
              ) : (
                candidates.map((c) => (
                  <label
                    key={c.hotspot.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
                      attachChoice === c.hotspot.id
                        ? 'border-forest-500 bg-forest-50'
                        : 'border-sand-200 bg-white hover:border-forest-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attach"
                      checked={attachChoice === c.hotspot.id}
                      onChange={() => setAttachChoice(c.hotspot.id)}
                      className="mt-1 accent-forest-600"
                    />
                    <span className="text-sm">
                      <span className="font-medium text-ink">{c.hotspot.title}</span>
                      <br />
                      <span className="text-ink-muted text-xs">
                        {c.hotspot.location_label}
                      </span>
                      <br />
                      <span className="text-[11px] text-forest-700">
                        {c.reason === 'nearby' || c.reason === 'both'
                          ? `~${c.distanceMeters}m `
                          : ''}
                        {c.reason === 'label' ? 'strong label match' : ''}
                      </span>
                    </span>
                  </label>
                ))
              )}
              <label
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
                  attachChoice === 'new'
                    ? 'border-forest-500 bg-forest-50'
                    : 'border-sand-200 bg-white hover:border-forest-300'
                }`}
              >
                <input
                  type="radio"
                  name="attach"
                  checked={attachChoice === 'new'}
                  onChange={() => setAttachChoice('new')}
                  className="mt-1 accent-forest-600"
                />
                <span className="text-sm font-medium text-ink">{t.newReport.createNew}</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button onClick={onCancel} className="btn-ghost">
              {t.common.cancel}
            </button>
            <button
              onClick={onSubmit}
              disabled={!canSubmit || submitting}
              className="btn-primary"
            >
              {submitting ? t.newReport.submitting : t.newReport.submit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="text-ink-muted w-32 shrink-0 text-xs pt-0.5">{label}</dt>
      <dd className="flex-1 text-ink">{children}</dd>
    </div>
  );
}
