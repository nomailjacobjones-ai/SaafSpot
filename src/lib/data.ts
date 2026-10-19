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

  // A community-submitted context event. The DB trigger derives the hotspot's
  // status from the inserted report row; we do not set status here.
  await supabase.from('activity_events').insert({
    hotspot_id: hotspotId,
    event_type: input.is_cleanup ? 'cleanup_observed' : 'report_added',
    detail: input.is_cleanup
      ? 'Community-submitted cleanup observation.'
      : 'Community-submitted observation logged.',
  });

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
    detail: 'Community-submitted confirmation received.',
  });
  // The DB trigger on confirmations recomputes status; no client UPDATE.
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
// Brief flag (the only status a client may request, via a narrow RPC)
// ---------------------------------------------------------------------------

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
        detail: 'Action brief prepared by a community member.',
        created_at: new Date().toISOString(),
      });
    }
    return;
  }
  // The DB function mark_brief_prepared only sets that one status, refuses to
  // overwrite cleanup_observed/recurring, and inserts the activity event.
  const { error } = await supabase.rpc('mark_brief_prepared', {
    target_hotspot: hotspotId,
  });
  if (error) throw error;
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
