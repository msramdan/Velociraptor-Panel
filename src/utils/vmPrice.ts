import type { PricingRule } from '../types';

/** Console cards use ~730 hours (24×30.4). Billing cap in docs is 672. */
const HOURS_PER_MONTH = 730;
const EXTREME_FACTOR = 1.7;

function matchTier(rules: PricingRule[], value: number, threshold: (rule: PricingRule) => number) {
  return rules
    .filter((rule) => threshold(rule) <= value)
    .sort((a, b) => threshold(b) - threshold(a))[0];
}

export function poolPriceFactor(poolName?: string) {
  const name = (poolName ?? '').toLowerCase();
  if (name.includes('extreme') || name.includes('pro')) return EXTREME_FACTOR;
  return 1;
}

export function estimateVmPrice({
  vcpu,
  ramGb,
  diskGb,
  policy,
  poolName,
}: {
  vcpu: number;
  ramGb: number;
  diskGb: number;
  policy: PricingRule[];
  poolName?: string;
}) {
  const cpuRule = matchTier(
    policy.filter((rule) => rule.resourceType === 'CPU'),
    vcpu,
    (rule) => rule.numCpus ?? 0,
  );
  const ramRule = matchTier(
    policy.filter((rule) => rule.resourceType === 'RAM'),
    ramGb * 1024,
    (rule) => rule.megsRam ?? 0,
  );
  const diskRule = matchTier(
    policy.filter((rule) => rule.resourceType === 'STORAGE' && rule.serviceNameInUptime === 'main'),
    diskGb,
    (rule) => rule.gigsStorage ?? 0,
  );

  if (!cpuRule || !ramRule || !diskRule) return null;

  const hourly =
    (vcpu * cpuRule.pricePerUnit + ramGb * ramRule.pricePerUnit + diskGb * diskRule.pricePerUnit) *
    poolPriceFactor(poolName);

  return {
    hourly: Math.round(hourly),
    monthly: Math.round(hourly * HOURS_PER_MONTH),
  };
}
