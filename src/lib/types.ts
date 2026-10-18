export type Category =
  | 'overflowing_bin'
  | 'uncollected_waste'
  | 'illegal_dumping'
  | 'missing_damaged_bin'
  | 'other';

export type Status =
  | 'reported'
  | 'corroborated'
  | 'brief_prepared'
  | 'cleanup_observed'
  | 'recurring';

export type EventType =
  | 'report_added'
  | 'cleanup_observed'
  | 'status_changed'
  | 'confirmation_added'
  | 'brief_prepared'
  | 'recurrence_detected';

export interface Hotspot {
  id: string;
  category: Category;
  location_label: string;
  lat: number;
  lng: number;
  status: Status;
  title: string;
  created_at: string;
  updated_at: string;
  is_demo: boolean;
}

export interface Report {
  id: string;
  hotspot_id: string;
  category: Category;
  location_label: string;
  lat: number;
  lng: number;
  observed_at: string;
  description: string;
  photo_path: string | null;
  reporter_identity: string;
  is_cleanup: boolean;
  is_demo: boolean;
  created_at: string;
}

export interface Confirmation {
  id: string;
  hotspot_id: string;
  identity: string;
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  hotspot_id: string;
  event_type: EventType;
  from_status: Status | null;
  to_status: Status | null;
  detail: string;
  created_at: string;
}

export interface HotspotDetail extends Hotspot {
  reports: Report[];
  confirmations: Confirmation[];
  events: ActivityEvent[];
}

export type View = 'home' | 'new' | 'detail' | 'brief' | 'about';

export interface NewReportDraft {
  category: Category | '';
  location_label: string;
  lat: string;
  lng: string;
  observed_at: string;
  description: string;
  photo: File | null;
  is_cleanup: boolean;
}

export const CATEGORIES: Category[] = [
  'overflowing_bin',
  'uncollected_waste',
  'illegal_dumping',
  'missing_damaged_bin',
  'other',
];

export const STATUSES: Status[] = [
  'reported',
  'corroborated',
  'brief_prepared',
  'cleanup_observed',
  'recurring',
];
