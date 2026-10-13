// What every part of an area shares.
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Point = { name: string; x: number; y: number };

export const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
// Whether the last save succeeded, shared by every area.
export const save = { ok: true };
// What has been picked, by area and point, since the hero last rested. Resting lets it grow back.
export const PICKED = new Set<string>();
