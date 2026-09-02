import { apiRequest } from './client';
import { endpoints } from './endpoints';
import type { PricingRule } from '../types';

export function getPricingPolicy() {
  return apiRequest<{ policy?: PricingRule[] }>(endpoints.pricingPolicy).then(
    (payload) => payload.policy ?? [],
  );
}
