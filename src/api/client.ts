import { env } from '../constants/env';
import { getStoredApiKey } from '../storage/secureStore';
import { ApiError } from '../types';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  form?: Record<string, string | number | boolean | undefined>;
  locationSlug?: string | null;
};

function compactParams(params?: Record<string, string | number | boolean | undefined>) {
  const body = new URLSearchParams();
  if (!params) return body;
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    body.append(key, String(value));
  });
  return body;
}

function buildUrl(path: string, locationSlug?: string | null) {
  const base = env.baseUrl.replace(/\/$/, '');
  if (locationSlug) {
    return `${base}/${locationSlug}${path}`;
  }
  return `${base}${path}`;
}

export async function resolveApiKey(): Promise<string> {
  const stored = await getStoredApiKey();
  return stored || env.apiKey;
}

export function extractApiError(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload && 'errors' in payload) {
    const errors = (payload as { errors: unknown }).errors;
    if (typeof errors === 'string') return errors;
    try {
      return JSON.stringify(errors);
    } catch {
      return fallback;
    }
  }
  if (typeof payload === 'object' && payload && 'message' in payload) {
    return String((payload as { message: unknown }).message);
  }
  return fallback;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const apiKey = await resolveApiKey();
  if (!apiKey) {
    throw new ApiError('API key belum diisi.', 401, null);
  }

  const url = new URL(buildUrl(path, options.locationSlug));
  compactParams(options.query).forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: Record<string, string> = { apikey: apiKey };
  const init: RequestInit = { method: options.method ?? 'GET', headers };

  if (options.form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    init.body = compactParams(options.form).toString();
  }

  const response = await fetch(url.toString(), init);
  const raw = await response.text();
  let payload: unknown = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }
  }

  if (!response.ok) {
    throw new ApiError(extractApiError(payload, `IDCloudHost error ${response.status}`), response.status, payload);
  }

  return payload as T;
}
