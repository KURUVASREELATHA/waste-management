// Central API configuration for WasteWise.
// The backend URL is injected at build time via VITE_API_URL (set by the deploy platform).
// Falls back to localhost for local development.

export const SERVER_URL: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export const API_BASE_URL: string = `${SERVER_URL}/api`;
