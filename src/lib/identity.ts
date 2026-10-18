// Opaque per-device identity used only to prevent duplicate confirmations
// and to tag a reporter's own observations. This is NOT authentication and
// stores no email, phone, or personal data.
const KEY = 'saafspot.identity';

export function getIdentity(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      id = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Fallback if localStorage is unavailable (private mode)
    return `eph-${Math.random().toString(36).slice(2)}`;
  }
}
