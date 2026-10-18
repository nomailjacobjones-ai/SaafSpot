import { supabase, isSupabaseConfigured, REPORTS_BUCKET } from './supabaseClient';
import { getIdentity } from './identity';
import { stripImageMetadata } from './image';
import {
  demoConfirmations,
  demoEvents,
  demoHotspots,
  demoReports,
} from './demoData';
import type {
  ActivityEvent,
  Category,
  Confirmation,
  Hotspot,
  HotspotDetail,
  Report,
  Status,
} from './types';

export const backendActive = isSupabaseConfigured;

// ---------------------------------------------------------------------------
// Read paths
// ---------------------------------------------------------------------------

export async function fetchHotspots(): Promise<Hotspot[]> {
  if (!supabase) return demoHotspots;
  const { data, error } = await supabase
    .from('hotspots')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Hotspot[];
}

export async function fetchHotspotDetail(id: string): Promise<HotspotDetail | null> {
  if (!supabase) {
    const h = demoHotspots.find((x) => x.id === id);
    if (!h) return null;
    return {
      ...h,
      reports: demoReports.filter((r) => r.hotspot_id === id),
      confirmations: demoConfirmations.filter((c) => c.hotspot_id === id),
      events: demoEvents.filter((e) => e.hotspot_id === id).sort((a, b) => a.created_at.localeCompare(b.created_at)),
    };
  }
  const [h, r, c, e] = await Promise.all([
    supabase.from('hotspots').select('*').eq('id', id).maybeSingle(),
    supabase.from('reports').select('*').eq('hotspot_id', id).order('observed_at', { ascending: true }),
    supabase.from('confirmations').select('*').eq('hotspot_id', id).order('created_at', { ascending: true }),
    supabase.from('activity_events').select('*').eq('hotspot_id', id).order('created_at', { ascending: true }),
  ]);
  if (h.error || r.error || c.error || e.error) {
    throw h.error ?? r.error ?? c.error ?? e.error;
  }
  if (!h.data) return null;
  return {
    ...(h.data as Hotspot),
    reports: (r.data ?? []) as Report[],
    confirmations: (c.data ?? []) as Confirmation[],
    events: (e.data ?? []) as ActivityEvent[],
  };
}

// ---------------------------------------------------------------------------
// Create report (with optional duplicate-handling)
// ---------------------------------------------------------------------------

export interface CreateReportInput {
  category: Category;
  location_label: string;
  lat: number;
  lng: number;
  observed_at: string; // ISO
  description: string;
  is_cleanup: boolean;
  photo: File | null;
  attachToHotspotId?: string; // when user chose an existing candidate
}

export interface CreateReportResult {
  hotspot_id: string;
  report_id: string;
  created_new_hotspot: boolean;
}

export async function createReport(
  input: CreateReportInput,
): Promise<CreateReportResult> {
  const identity = getIdentity();
  let photoPath: string | null = null;

  if (input.photo && supabase) {
    // Strip EXIF/metadata (incl. GPS) before storing public evidence.
    const cleaned = await stripImageMetadata(input.photo);
    const ext = cleaned.type === 'image/png' ? 'png' : 'jpg';
    const path = `${identity}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from(REPORTS_BUCKET)
      .upload(path, cleaned, {
        contentType: cleaned.type || input.photo.type,
        upsert: false,
      });
    if (upErr) throw new Error(`Photo upload failed: ${upErr.message}`);
    photoPath = path;
  }

  if (!supabase) {
    // Local demo mode: synthesize in-memory only. Not persisted across reload.
    const hotspotId =
      input.attachToHotspotId ?? crypto.randomUUID();
    const reportId = crypto.randomUUID();
    if (!input.attachToHotspotId) {
      demoHotspots.unshift({
        id: hotspotId,
        category: input.category,
        location_label: input.location_label,
        lat: input.lat,
        lng: input.lng,
        status: input.is_cleanup ? 'cleanup_observed' : 'reported',
        title: input.location_label,
        created_at: input.observed_at,
        updated_at: new Date().toISOString(),
        is_demo: true,
      });
    }
    demoReports.push({
      id: reportId,
      hotspot_id: hotspotId,
      category: input.category,
      location_label: input.location_label,
      lat: input.lat,
      lng: input.lng,
      observed_at: input.observed_at,
      description: input.description,
      photo_path: photoPath,
      reporter_identity: identity,
      is_cleanup: input.is_cleanup,
      is_demo: true,
      created_at: new Date().toISOString(),
    });
    demoEvents.push({
      id: crypto.randomUUID(),
      hotspot_id: hotspotId,
      event_type: input.is_cleanup ? 'cleanup_observed' : 'report_added',
      from_status: null,
      to_status: input.is_cleanup ? 'cleanup_observed' : 'reported',
      detail: input.is_cleanup ? 'Cleanup observation logged.' : 'New observation logged.',
      created_at: new Date().toISOString(),
    });
    return {
      hotspot_id: hotspotId,
      report_id: reportId,
      created_new_hotspot: !input.attachToHotspotId,
    };
  }

  // Production path
  let hotspotId = input.attachToHotspotId ?? null;

  if (!hotspotId) {
    const newStatus: Status = input.is_cleanup ? 'cleanup_observed' : 'reported';
    const { data: hData, error: hErr } = await supabase
      .from('hotspots')
      .insert({
        category: input.category,
        location_label: input.location_label,
        lat: input.lat,
        lng: input.lng,
        status: newStatus,
        title: input.location_label,
        is_demo: false,
      })
      .select('id')
      .single();
    if (hErr) throw hErr;
    hotspotId = (hData as { id: string }).id;
  }

  const { data: rData, error: rErr } = await supabase
    .from('reports')
    .insert({
      hotspot_id: hotspotId,
      category: input.category,
      location_label: input.location_label,
      lat: input.lat,
      lng: input.lng,
      observed_at: input.observed_at,
      description: input.description,
      photo_path: photoPath,
      reporter_identity: identity,
      is_cleanup: input.is_cleanup,
      is_demo: false,
    })
    .select('id')
    .single();
  if (rErr) throw rErr;
  const reportId = (rData as { id: string }).id;

  // Append-only event. Recompute hotspot status from full report set so the
  // community-evidence state stays transparent and auditable.
  await recomputeHotspotStatus(hotspotId);

  return {
    hotspot_id: hotspotId,
    report_id: reportId,
    created_new_hotspot: !input.attachToHotspotId,
  };
}

// ---------------------------------------------------------------------------
// Confirmations (one per identity)
// ---------------------------------------------------------------------------

export async function confirmHotspot(
  hotspotId: string,
): Promise<{ alreadyConfirmed: boolean }> {
  const identity = getIdentity();
  if (!supabase) {
    const exists = demoConfirmations.find(
      (c) => c.hotspot_id === hotspotId && c.identity === identity,
    );
    if (exists) return { alreadyConfirmed: true };
    demoConfirmations.push({
      id: crypto.randomUUID(),
      hotspot_id: hotspotId,
      identity,
      created_at: new Date().toISOString(),
    });
    demoEvents.push({
      id: crypto.randomUUID(),
      hotspot_id: hotspotId,
      event_type: 'confirmation_added',
      from_status: null,
      to_status: null,
      detail: 'Community confirmation received.',
      created_at: new Date().toISOString(),
    });
    return { alreadyConfirmed: false };
  }
  const { error } = await supabase.from('confirmations').insert({
    hotspot_id: hotspotId,
    identity,
  });
  if (error) {
    // Unique constraint violation => already confirmed
    if (error.code === '23505') return { alreadyConfirmed: true };
    throw error;
  }
  await supabase.from('activity_events').insert({
    hotspot_id: hotspotId,
    event_type: 'confirmation_added',
    detail: 'Community confirmation received.',
  });
  await recomputeHotspotStatus(hotspotId);
  return { alreadyConfirmed: false };
}

export function isConfirmedByMe(
  hotspotId: string,
  confirmations: Confirmation[],
): boolean {
  const identity = getIdentity();
  return confirmations.some((c) => c.identity === identity);
}

// ---------------------------------------------------------------------------
// Status recomputation + brief flag
// ---------------------------------------------------------------------------

export async function recomputeHotspotStatus(hotspotId: string): Promise<void> {
  if (!supabase) return;
  const { data: reports } = await supabase
    .from('reports')
    .select('is_cleanup, observed_at')
    .eq('hotspot_id', hotspotId)
    .order('observed_at', { ascending: true });
  const { data: conf } = await supabase
    .from('confirmations')
    .select('id')
    .eq('hotspot_id', hotspotId);
  const rs = (reports ?? []) as { is_cleanup: boolean; observed_at: string }[];
  const confCount = (conf ?? []).length;

  const current = await supabase
    .from('hotspots')
    .select('status')
    .eq('id', hotspotId)
    .maybeSingle();
  const prev = (current.data as { status: Status } | null)?.status ?? 'reported';

  // Only auto-advance from 'reported' to 'corroborated' on confirmations.
  // Never auto-downgrade a brief_prepared / cleanup_observed status.
  let next: Status = prev;
  const hasCleanup = rs.some((r) => r.is_cleanup);
  const lastCleanupObs = rs
    .filter((r) => r.is_cleanup)
    .map((r) => r.observed_at)
    .sort()
    .at(-1);
  const laterReports = rs.filter(
    (r) => !r.is_cleanup && lastCleanupObs && r.observed_at > lastCleanupObs,
  );

  if (hasCleanup && laterReports.length > 0 && prev !== 'recurring') {
    next = 'recurring';
  } else if (confCount >= 2 && prev === 'reported') {
    next = 'corroborated';
  }

  if (next !== prev) {
    await supabase.from('hotspots').update({ status: next }).eq('id', hotspotId);
    await supabase.from('activity_events').insert({
      hotspot_id: hotspotId,
      event_type: 'status_changed',
      from_status: prev,
      to_status: next,
      detail:
        next === 'recurring'
          ? 'Recurrence detected after a new same-category report.'
          : 'Status updated after multiple confirmations.',
    });
  }
}

export async function markBriefPrepared(hotspotId: string): Promise<void> {
  if (!supabase) {
    const h = demoHotspots.find((x) => x.id === hotspotId);
    if (h && h.status !== 'brief_prepared') {
      const prev = h.status;
      h.status = 'brief_prepared';
      demoEvents.push({
        id: crypto.randomUUID(),
        hotspot_id: hotspotId,
        event_type: 'brief_prepared',
        from_status: prev,
        to_status: 'brief_prepared',
        detail: 'Action brief prepared.',
        created_at: new Date().toISOString(),
      });
    }
    return;
  }
  const { data: cur } = await supabase
    .from('hotspots')
    .select('status')
    .eq('id', hotspotId)
    .maybeSingle();
  const prev = (cur as { status: Status } | null)?.status;
  if (prev === 'brief_prepared') return;
  await supabase.from('hotspots').update({ status: 'brief_prepared' }).eq('id', hotspotId);
  await supabase.from('activity_events').insert({
    hotspot_id: hotspotId,
    event_type: 'brief_prepared',
    from_status: prev ?? null,
    to_status: 'brief_prepared',
    detail: 'Action brief prepared.',
  });
}

// ---------------------------------------------------------------------------
// Photo URL helper
// ---------------------------------------------------------------------------

export function photoPublicUrl(path: string | null): string | null {
  if (!path || !supabase) return null;
  const { data } = supabase.storage.from(REPORTS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Official complaint reference (local only, per hotspot)
// ---------------------------------------------------------------------------

export function getOfficialRef(hotspotId: string): string {
  try {
    return localStorage.getItem(`saafspot.ref.${hotspotId}`) ?? '';
  } catch {
    return '';
  }
}

export function saveOfficialRef(hotspotId: string, ref: string): void {
  try {
    localStorage.setItem(`saafspot.ref.${hotspotId}`, ref);
  } catch {
    // ignore storage errors
  }
}
