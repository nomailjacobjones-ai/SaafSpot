import type { ActivityEvent, Confirmation, Hotspot, Report, Status } from './types';

// Visibly-labeled FICTIONAL demo data, used only when the Supabase backend is
// not configured (local demo mode). Never presented as real local facts.
// Mirrors the seeded rows in the production database so behaviour is identical.

const H1 = '11111111-1111-1111-1111-111111111101';
const H2 = '11111111-1111-1111-1111-111111111102';
const H3 = '11111111-1111-1111-1111-111111111103';

const now = Date.now();
const days = (n: number) => new Date(now - n * 86400000).toISOString();

export const demoHotspots: Hotspot[] = [
  {
    id: H1,
    category: 'overflowing_bin',
    location_label: 'Liberty Market Roundabout, Gulberg III',
    lat: 31.5204,
    lng: 74.3476,
    status: 'corroborated',
    title: 'Overflowing bin near Liberty Market',
    created_at: days(14),
    updated_at: days(2),
    is_demo: true,
  },
  {
    id: H2,
    category: 'illegal_dumping',
    location_label: 'Back lane behind Main Boulevard, Gulberg II',
    lat: 31.5189,
    lng: 74.3451,
    status: 'recurring',
    title: 'Illegal dumping in Gulberg II back lane',
    created_at: days(21),
    updated_at: days(1),
    is_demo: true,
  },
  {
    id: H3,
    category: 'missing_damaged_bin',
    location_label: 'Bus stop near Liberty Chowk',
    lat: 31.5198,
    lng: 74.3482,
    status: 'cleanup_observed',
    title: 'Missing bin at Liberty Chowk bus stop',
    created_at: days(30),
    updated_at: days(5),
    is_demo: true,
  },
];

export const demoReports: Report[] = [
  {
    id: 'r-demo-1',
    hotspot_id: H1,
    category: 'overflowing_bin',
    location_label: 'Liberty Market Roundabout, Gulberg III',
    lat: 31.5204,
    lng: 74.3476,
    observed_at: days(14),
    description: 'Bin next to the fruit carts is overflowing onto the pavement. Strong smell, flies.',
    photo_path: null,
    reporter_identity: 'demo-a',
    is_cleanup: false,
    is_demo: true,
    created_at: days(14),
  },
  {
    id: 'r-demo-2',
    hotspot_id: H1,
    category: 'overflowing_bin',
    location_label: 'Liberty Market Roundabout, Gulberg III',
    lat: 31.52038,
    lng: 74.34762,
    observed_at: days(6),
    description: 'Still overflowing this morning, waste spilling into the gutter.',
    photo_path: null,
    reporter_identity: 'demo-b',
    is_cleanup: false,
    is_demo: true,
    created_at: days(6),
  },
  {
    id: 'r-demo-3',
    hotspot_id: H2,
    category: 'illegal_dumping',
    location_label: 'Back lane behind Main Boulevard, Gulberg II',
    lat: 31.5189,
    lng: 74.3451,
    observed_at: days(21),
    description: 'Construction debris and household waste dumped in the lane.',
    photo_path: null,
    reporter_identity: 'demo-a',
    is_cleanup: false,
    is_demo: true,
    created_at: days(21),
  },
  {
    id: 'r-demo-4',
    hotspot_id: H2,
    category: 'illegal_dumping',
    location_label: 'Back lane behind Main Boulevard, Gulberg II',
    lat: 31.51892,
    lng: 74.34508,
    observed_at: days(12),
    description: 'Pile has grown, now blocking half the lane.',
    photo_path: null,
    reporter_identity: 'demo-c',
    is_cleanup: false,
    is_demo: true,
    created_at: days(12),
  },
  {
    id: 'r-demo-5',
    hotspot_id: H2,
    category: 'illegal_dumping',
    location_label: 'Back lane behind Main Boulevard, Gulberg II',
    lat: 31.51888,
    lng: 74.34512,
    observed_at: days(8),
    description: 'Cleared for two days but new dumping appeared today. Recurring.',
    photo_path: null,
    reporter_identity: 'demo-a',
    is_cleanup: false,
    is_demo: true,
    created_at: days(8),
  },
  {
    id: 'r-demo-6',
    hotspot_id: H3,
    category: 'missing_damaged_bin',
    location_label: 'Bus stop near Liberty Chowk',
    lat: 31.5198,
    lng: 74.3482,
    observed_at: days(30),
    description: 'The public bin at this bus stop is missing entirely.',
    photo_path: null,
    reporter_identity: 'demo-b',
    is_cleanup: false,
    is_demo: true,
    created_at: days(30),
  },
  {
    id: 'r-demo-7',
    hotspot_id: H3,
    category: 'missing_damaged_bin',
    location_label: 'Bus stop near Liberty Chowk',
    lat: 31.51979,
    lng: 74.34821,
    observed_at: days(10),
    description: 'A new bin has been installed and the area looks clean today.',
    photo_path: null,
    reporter_identity: 'demo-c',
    is_cleanup: true,
    is_demo: true,
    created_at: days(10),
  },
];

export const demoConfirmations: Confirmation[] = [
  { id: 'c-demo-1', hotspot_id: H1, identity: 'demo-b', created_at: days(6) },
  { id: 'c-demo-2', hotspot_id: H1, identity: 'demo-c', created_at: days(5) },
  { id: 'c-demo-3', hotspot_id: H2, identity: 'demo-c', created_at: days(12) },
];

export const demoEvents: ActivityEvent[] = [
  { id: 'e1', hotspot_id: H1, event_type: 'report_added', from_status: null, to_status: 'reported', detail: 'First observation logged.', created_at: days(14) },
  { id: 'e2', hotspot_id: H1, event_type: 'report_added', from_status: null, to_status: 'reported', detail: 'Second observation added.', created_at: days(6) },
  { id: 'e3', hotspot_id: H1, event_type: 'confirmation_added', from_status: null, to_status: 'corroborated', detail: 'Community confirmation received.', created_at: days(6) },
  { id: 'e4', hotspot_id: H1, event_type: 'status_changed', from_status: 'reported', to_status: 'corroborated', detail: 'Status updated after multiple confirmations.', created_at: days(5) },
  { id: 'e5', hotspot_id: H2, event_type: 'report_added', from_status: null, to_status: 'reported', detail: 'First observation logged.', created_at: days(21) },
  { id: 'e6', hotspot_id: H2, event_type: 'report_added', from_status: null, to_status: 'reported', detail: 'Second observation added.', created_at: days(12) },
  { id: 'e7', hotspot_id: H2, event_type: 'cleanup_observed', from_status: null, to_status: 'cleanup_observed', detail: 'Lane cleared briefly.', created_at: days(10) },
  { id: 'e8', hotspot_id: H2, event_type: 'report_added', from_status: null, to_status: 'recurring', detail: 'New dumping observed after cleanup.', created_at: days(8) },
  { id: 'e9', hotspot_id: H2, event_type: 'status_changed', from_status: 'cleanup_observed', to_status: 'recurring', detail: 'Recurrence detected after a new same-category report.', created_at: days(8) },
  { id: 'e10', hotspot_id: H3, event_type: 'report_added', from_status: null, to_status: 'reported', detail: 'First observation logged.', created_at: days(30) },
  { id: 'e11', hotspot_id: H3, event_type: 'cleanup_observed', from_status: null, to_status: 'cleanup_observed', detail: 'New bin installed, area clean.', created_at: days(10) },
  { id: 'e12', hotspot_id: H3, event_type: 'status_changed', from_status: 'reported', to_status: 'cleanup_observed', detail: 'Cleanup confirmed with dated evidence.', created_at: days(10) },
];

export const LAHORE_CENTER = { lat: 31.5204, lng: 74.3476 };

// Statuses that represent a "still problematic" state for counts.
export const ACTIVE_STATUSES: Status[] = ['reported', 'corroborated', 'recurring'];
