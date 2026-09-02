export function asArray<T>(payload: T | T[] | null | undefined | ''): T[] {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : [payload];
}

export function formatIdr(value: number | null | undefined): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export function formatUnix(seconds: number | null | undefined): string {
  if (!seconds) return '—';
  return new Date(seconds * 1000).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ramLabel(mb: number): string {
  if (mb >= 1024 && mb % 1024 === 0) return `${mb / 1024} GB`;
  return `${mb} MB`;
}

export function invoiceStatusLabel(status: number): string {
  if (status === 10) return 'Lunas';
  if (status === 5 || status === 1) return 'Menunggu';
  return `Status ${status}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
