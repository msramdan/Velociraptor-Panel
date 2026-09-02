const DEFAULT_BASE_URL = 'https://api.idcloudhost.com/v1';

export const env = {
  baseUrl: process.env.EXPO_PUBLIC_IDCLOUDHOST_BASE_URL ?? DEFAULT_BASE_URL,
  apiKey: process.env.EXPO_PUBLIC_IDCLOUDHOST_API_KEY ?? '',
} as const;
