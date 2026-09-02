import * as SecureStore from 'expo-secure-store';

import { API_KEY_STORAGE, LOCATION_SLUG_STORAGE } from './keys';

async function canUseSecureStore() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function getStoredApiKey(): Promise<string | null> {
  if (!(await canUseSecureStore())) return null;
  try {
    return await SecureStore.getItemAsync(API_KEY_STORAGE);
  } catch {
    return null;
  }
}

export async function setStoredApiKey(apiKey: string): Promise<void> {
  if (!(await canUseSecureStore())) return;
  try {
    await SecureStore.setItemAsync(API_KEY_STORAGE, apiKey);
  } catch {
    // Web / unsupported platforms keep the key in env only.
  }
}

export async function getStoredLocationSlug(): Promise<string | null> {
  if (!(await canUseSecureStore())) return null;
  try {
    return await SecureStore.getItemAsync(LOCATION_SLUG_STORAGE);
  } catch {
    return null;
  }
}

export async function setStoredLocationSlug(slug: string): Promise<void> {
  if (!(await canUseSecureStore())) return;
  try {
    await SecureStore.setItemAsync(LOCATION_SLUG_STORAGE, slug);
  } catch {
    // ignore
  }
}
