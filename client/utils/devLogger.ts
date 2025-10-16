// devLogger.ts - Structured console logging for API and Optimistic UI flows

type LogLevel = 'info' | 'warn' | 'error';

// Expose a simple global report bucket for quick inspection
declare global {
  interface Window {
    __API_REPORTS__?: Record<string, any>;
  }
}

export const getApiBase = (): string => {
  const rawBase = (import.meta as any).env?.VITE_API_URL as string | undefined;
  const base = rawBase
    ? (rawBase.replace(/\/+/g, '').endsWith('/api') ? rawBase.replace(/\/+/g, '') : `${rawBase.replace(/\/+/g, '')}/api`)
    : '/api';
  return base;
};

export function logGroup(title: string, details?: any) {
  try {
    console.groupCollapsed(title);
    if (details !== undefined) console.log(details);
    console.groupEnd();
  } catch (e) {
    // no-op
  }
}

export function logAPI(path: string, status: 'start' | 'success' | 'fallback' | 'error', info?: any) {
  const prefix = `[api] ${path}`;
  switch (status) {
    case 'start':
      console.info(`${prefix} start`, info ?? '');
      break;
    case 'success':
      console.info(`${prefix} success`, info ?? '');
      break;
    case 'fallback':
      console.warn(`${prefix} fallback_to_local`, info ?? '');
      break;
    case 'error':
      console.error(`${prefix} error`, info ?? '');
      break;
  }
  // Store basic report
  const bucket = (window.__API_REPORTS__ = window.__API_REPORTS__ || {});
  bucket[path] = { status, info, ts: Date.now() };
}

export function logOptimistic(action: string, outcome: 'stored' | 'updated' | 'removed', info?: any) {
  const prefix = `[optimistic] ${action}`;
  console.info(`${prefix} ${outcome}`, info ?? '');
}

export async function reportAPIs() {
  const base = getApiBase();
  const endpoints = ['/health', '/menu', '/items', '/allergen-groups', '/groups'];

  console.groupCollapsed('[api-report] starting checks');
  console.log({ base, endpoints });
  console.groupEnd();

  await Promise.all(
    endpoints.map(async (ep) => {
      try {
        logAPI(ep, 'start');
        const res = await fetch(`${base}${ep}`);
        const ok = res.ok;
        const status = res.status;
        let data: any = null;
        try { data = await res.json(); } catch {}
        logAPI(ep, ok ? 'success' : 'error', { status, count: Array.isArray(data) ? data.length : undefined });
      } catch (err) {
        logAPI(ep, 'error', { error: String(err) });
      }
    })
  );

  console.info('[api-report] complete. See window.__API_REPORTS__ and console logs.');
}