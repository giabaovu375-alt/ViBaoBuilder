/* ============================================================================
 * Design tokens + shared constants for the editor
 * ========================================================================== */
export const T = {
  brand: "#0A2463",
  brandSoft: "#1B3A8A",
  accent: "#F5C518",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9FC",
  canvasBg: "#E8EEF8",
  border: "#E0E8F4",
  borderStrong: "#C9D5E8",
  textPrimary: "#0A2463",
  textMuted: "#7A90B0",
  danger: "#E11D48",
  radius: 8,
  headerH: 52,
  shadow: "0 1px 2px rgba(10,36,99,0.06), 0 4px 12px rgba(10,36,99,0.04)",
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
} as const;

export const CANVAS_W = 960;
export const CANVAS_H = 540;

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
