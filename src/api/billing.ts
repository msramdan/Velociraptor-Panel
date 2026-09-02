import { apiRequest } from './client';
import { endpoints } from './endpoints';
import type { BillingAccount, CreditRecord, Invoice } from '../types';
import { asArray } from '../utils/format';

export function listBillingAccounts() {
  return apiRequest<BillingAccount[] | BillingAccount>(endpoints.billingAccounts).then(asArray);
}

export function getBillingAccount(billing_account_id: number) {
  return apiRequest<BillingAccount>(endpoints.billingAccount, {
    query: { billing_account_id },
  });
}

export async function getUnpaidAmount(billing_account_id: number): Promise<number> {
  const payload = await apiRequest<{ message?: number }>(endpoints.unpaidAmount, {
    query: { billing_account_id },
  });
  return Number(payload?.message ?? 0);
}

export function listCredits(billing_account_id: number) {
  return apiRequest<CreditRecord[] | CreditRecord>(endpoints.creditList, {
    query: { billing_account_id },
  }).then(asArray);
}

export function listInvoices(billing_account_id: number) {
  return apiRequest<Invoice[] | Invoice>(endpoints.invoices, {
    query: { billing_account_id },
  }).then((payload) =>
    asArray(payload)
      .filter((invoice) => invoice.document_type !== 'report')
      .sort((a, b) => b.created - a.created),
  );
}

export function requestTopupInvoice(billing_account_id: number, amount: number) {
  return apiRequest<{ success?: boolean }>(endpoints.creditInvoice, {
    method: 'POST',
    form: { billing_account_id, amount },
  });
}

export function buyCredit(billing_account_id: number, payment_object_id: number, amount: number) {
  return apiRequest<{ success?: boolean }>(endpoints.creditBuy, {
    method: 'POST',
    form: { billing_account_id, payment_object_id, amount },
  });
}

export function parseLinkMethods(additionalData?: string): string[] {
  if (!additionalData) return [];
  try {
    const parsed = JSON.parse(additionalData) as { link_methods?: string[] };
    return parsed.link_methods ?? [];
  } catch {
    return [];
  }
}

export const DUITKU_LABELS: Record<string, string> = {
  'duitku::I1': 'BCA Virtual Account',
  'duitku::BR': 'BRIVA',
  'duitku::SP': 'ShopeePay',
  'duitku::OV': 'OVO',
  'duitku::DA': 'DANA',
  'duitku::A1': 'ATM Bersama',
  'duitku::FT': 'Bank Transfer',
  'duitku::M1': 'Mandiri VA',
};
