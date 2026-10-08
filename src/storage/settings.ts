// Per-player preferences: music and sound effect volume, mute, and how much the health display shows.
export type Settings = { music: number; effects: number; muted: boolean; hud: 'full' | 'compact' };

const KEY = 'tide-keeps.settings.v1';
const DEFAULTS: Settings = { music: 0.6, effects: 0.7, muted: false, hud: 'full' };
let session: Settings | undefined;

const share = (value: unknown, fallback: number) => typeof value === 'number' && value >= 0 && value <= 1 ? value : fallback;

export function loadSettings(): Settings {
  if (!session) {
    let saved: Record<string, unknown> = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { /* Defaults, then. */ }
    session = {
      music: share(saved.music, DEFAULTS.music),
      effects: share(saved.effects, DEFAULTS.effects),
      muted: typeof saved.muted === 'boolean' ? saved.muted : DEFAULTS.muted,
      hud: saved.hud === 'compact' ? 'compact' : 'full',
    };
  }
  return session;
}

export function saveSettings(change: Partial<Settings>): Settings {
  session = { ...loadSettings(), ...change };
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch { /* Applies for this visit only. */ }
  return session;
}
