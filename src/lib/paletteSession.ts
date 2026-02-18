export const PALETTE_SESSION_KEY = "palette_session_id";

export function getPaletteSessionId(): string {
  let sessionId = localStorage.getItem(PALETTE_SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(PALETTE_SESSION_KEY, sessionId);
  }
  return sessionId;
}
