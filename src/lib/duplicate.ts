import type { Category, Hotspot } from './types';
import { distanceMeters, labelSimilarity } from './geo';

export interface DuplicateCandidate {
  hotspot: Hotspot;
  reason: 'nearby' | 'label' | 'both';
  distanceMeters: number;
  labelSimilarity: number;
}

const NEARBY_RADIUS_M = 100;
const LABEL_THRESHOLD = 0.6;

export function findDuplicateCandidates(
  category: Category,
  lat: number,
  lng: number,
  locationLabel: string,
  hotspots: Hotspot[],
): DuplicateCandidate[] {
  const candidates: DuplicateCandidate[] = [];
  for (const h of hotspots) {
    if (h.category !== category) continue;
    const dist = distanceMeters({ lat, lng }, { lat: h.lat, lng: h.lng });
    const sim = labelSimilarity(locationLabel, h.location_label);
    const nearby = dist <= NEARBY_RADIUS_M;
    const labelMatch = sim >= LABEL_THRESHOLD;
    if (!nearby && !labelMatch) continue;
    candidates.push({
      hotspot: h,
      reason: nearby && labelMatch ? 'both' : nearby ? 'nearby' : 'label',
      distanceMeters: Math.round(dist),
      labelSimilarity: Math.round(sim * 100) / 100,
    });
  }
  return candidates.sort((a, b) => {
    if (a.reason === 'both' && b.reason !== 'both') return -1;
    if (b.reason === 'both' && a.reason !== 'both') return 1;
    return a.distanceMeters - b.distanceMeters;
  });
}
