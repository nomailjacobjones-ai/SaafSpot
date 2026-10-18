import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Category, Status } from '@/lib/types';

// Fix default icon asset paths for the bundler.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function makeIcon(category: Category, status: Status): L.DivIcon {
  const color =
    status === 'recurring'
      ? '#E85A3F'
      : status === 'cleanup_observed'
        ? '#3A8AB0'
        : status === 'corroborated'
          ? '#2E7D43'
          : status === 'brief_prepared'
            ? '#C8920A'
            : '#6B7468';
  const glyph =
    category === 'overflowing_bin'
      ? 'O'
      : category === 'illegal_dumping'
        ? 'D'
        : category === 'missing_damaged_bin'
          ? 'B'
          : category === 'uncollected_waste'
            ? 'U'
            : '•';
  return L.divIcon({
    className: 'saafspot-marker',
    html: `<div class="saafspot-pin" style="background:${color}"><span>${glyph}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });
}

interface MapViewProps {
  hotspots: {
    id: string;
    category: Category;
    location_label: string;
    lat: number;
    lng: number;
    status: Status;
    title: string;
  }[];
  center: [number, number];
  onMarkerClick?: (id: string) => void;
  className?: string;
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapView({ hotspots, center, onMarkerClick, className }: MapViewProps) {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />
        {hotspots.map((h) => (
          <Marker
            key={h.id}
            position={[h.lat, h.lng]}
            icon={makeIcon(h.category, h.status)}
            eventHandlers={{
              click: () => onMarkerClick?.(h.id),
            }}
          >
            <Popup>
              <strong>{h.title}</strong>
              <br />
              {h.location_label}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

interface PickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
  center: [number, number];
  className?: string;
}

export function LocationPicker({ value, onChange, center, className }: PickerProps) {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />
        <Marker
          position={value ? [value.lat, value.lng] : center}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const m = e.target as L.Marker;
              const ll = m.getLatLng();
              onChange(ll.lat, ll.lng);
            },
          }}
        />
        <ClickPicker onChange={onChange} />
      </MapContainer>
    </div>
  );
}

function ClickPicker({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => onChange(e.latlng.lat, e.latlng.lng);
    map.on('click', handler);
    return () => {
      map.off('click', handler);
    };
  }, [map, onChange]);
  return null;
}
